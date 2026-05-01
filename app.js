const textInput = document.getElementById("text-input");
const sizeInput = document.getElementById("size-input");
const sizeValue = document.getElementById("size-value");
const eccInput = document.getElementById("ecc-input");
const darkInput = document.getElementById("dark-input");
const lightInput = document.getElementById("light-input");
const qrContainer = document.getElementById("qr-canvas");
const downloadPngBtn = document.getElementById("download-png");
const downloadJpegBtn = document.getElementById("download-jpeg");
const decodeResult = document.getElementById("decode-result");

const qrCode = new QRCodeStyling({
  width: Number(sizeInput.value),
  height: Number(sizeInput.value),
  type: "canvas",
  data: "",
  margin: 8,
  qrOptions: {
    errorCorrectionLevel: eccInput.value,
  },
  dotsOptions: {
    color: darkInput.value,
    type: "square",
  },
  backgroundOptions: {
    color: lightInput.value,
  },
});

/**
 * QRCodeStyling's internal encoder only uses the low byte of each JS char,
 * which corrupts any non-ASCII text. This helper converts a JS string into
 * a Latin-1 string where each character represents one UTF-8 byte,
 * so the QR encoder stores the correct byte sequence.
 */
function toUTF8(str) {
  return unescape(encodeURIComponent(str));
}

let isAttached = false;
let pendingDecode;

function render() {
  const data = textInput.value.trim();
  const hasData = data.length > 0;

  downloadPngBtn.disabled = !hasData;
  downloadJpegBtn.disabled = !hasData;

  if (!hasData) {
    qrContainer.innerHTML = "";
    isAttached = false;
    decodeResult.hidden = true;
    clearTimeout(pendingDecode);
    return;
  }

  const size = Number(sizeInput.value);

  qrCode.update({
    width: size,
    height: size,
    data: toUTF8(data),
    qrOptions: {
      errorCorrectionLevel: eccInput.value,
    },
    dotsOptions: {
      color: darkInput.value,
    },
    backgroundOptions: {
      color: lightInput.value,
    },
  });

  if (!isAttached) {
    qrCode.append(qrContainer);
    isAttached = true;
  }

  scheduleAutoDecode();
}

function scheduleAutoDecode() {
  clearTimeout(pendingDecode);
  pendingDecode = setTimeout(autoDecode, 60);
}

async function autoDecode() {
  // Wait for the library's most recent canvas drawing to finish
  // so we read pixels of the current QR, not the previous one.
  if (qrCode._canvasDrawingPromise) {
    try { await qrCode._canvasDrawingPromise; } catch { /* ignore */ }
  }

  const canvas = qrContainer.querySelector("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height);

  if (code && code.data) {
    showDecodeSuccess(decodeUtf8(code.data));
  } else {
    showDecodeError("Не удалось распознать QR код. Попробуйте увеличить размер или изменить цвета.");
  }
}

function syncSizeLabel() {
  sizeValue.textContent = sizeInput.value;
}

textInput.addEventListener("input", render);
sizeInput.addEventListener("input", syncSizeLabel);
sizeInput.addEventListener("change", render);
eccInput.addEventListener("change", render);
darkInput.addEventListener("input", render);
lightInput.addEventListener("input", render);

downloadPngBtn.addEventListener("click", () => {
  qrCode.download({ name: "qr-code", extension: "png" });
});
downloadJpegBtn.addEventListener("click", () => {
  qrCode.download({ name: "qr-code", extension: "jpeg" });
});

// --- Decode QR code ---

/**
 * Normalize jsQR's output to readable text.
 *
 * jsQR's behavior depends on the QR's encoding:
 *   - With a UTF-8 ECI marker (what most generators emit, including this one),
 *     jsQR decodes UTF-8 itself and returns real Unicode chars — no further
 *     work needed. Any codepoint > 0xFF is a tell that this happened.
 *   - Without the marker, jsQR returns raw bytes interpreted as Latin-1, and
 *     we have to re-interpret them as UTF-8 to get the original text back.
 */
function decodeUtf8(input) {
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) > 0xFF) {
      return input; // already decoded by jsQR
    }
  }
  try {
    const bytes = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      bytes[i] = input.charCodeAt(i);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return input; // not valid UTF-8 — leave as-is
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showDecodeSuccess(data) {
  let content = `<span class="decode-label">Содержимое QR кода</span>`;
  const safe = escapeHtml(data);

  // If it looks like a URL, make it clickable — but display the original
  // text so non-ASCII characters (e.g. Cyrillic) stay readable instead of
  // being shown percent-encoded by URL.href.
  try {
    const url = new URL(data);
    content += `<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
  } catch {
    content += safe;
  }

  decodeResult.innerHTML = content;
  decodeResult.className = "decode-result success";
  decodeResult.hidden = false;
}

function showDecodeError(msg) {
  decodeResult.innerHTML = msg;
  decodeResult.className = "decode-result error";
  decodeResult.hidden = false;
}

syncSizeLabel();
render();
