const updateSpecimens = () => {
  document.querySelectorAll('[data-type-row]').forEach((row) => {
    const sample = document.getElementById(`sample-${row.dataset.typeRow}`);
    const style = getComputedStyle(sample);
    row.querySelector('[data-size]').textContent = `${parseFloat(style.fontSize).toFixed(1)} px`;
    row.querySelector('[data-weight]').textContent = style.fontWeight;
    row.querySelector('[data-leading]').textContent = `${parseFloat(style.lineHeight).toFixed(1)} px`;
  });
  const rootStyle = getComputedStyle(document.documentElement);
  document.querySelectorAll('[data-token-value]').forEach((node) => {
    node.textContent = rootStyle.getPropertyValue(`--${node.dataset.tokenValue}`).trim();
  });
};
document.fonts.ready.then(updateSpecimens);
window.addEventListener('resize', updateSpecimens);
