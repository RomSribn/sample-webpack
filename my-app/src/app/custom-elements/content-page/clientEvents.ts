export function setActionButtonsEventListeners(
  publishCallBack: () => void, previewCallBack: () => void) {

  const publishBtn = document.getElementById('publishBtn');
  publishBtn.addEventListener('click', publishCallBack);

  const previewBtn = document.getElementById('previewBtn');
  previewBtn.addEventListener('click', previewCallBack);
}
