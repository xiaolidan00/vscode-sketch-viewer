console.log('sketch viewer');
const img = document.getElementById('previewImage');
img.addEventListener('load', () => {
  const setting = {
    scale: 1,
    left: 0,
    top: 0,
    x: 0,
    y: 0,
    enable: false,
    w: img.naturalWidth,
    h: img.naturalHeight,
    maxScale: 10,
    minScale: 0.1
  };

  function createStyle() {
    // console.log('style', setting);
    img.style.transform = `scale(${setting.scale}) translate(${setting.left}px,${setting.top}px)`;
  }
  function addAction(id, cb) {
    const dom = document.getElementById(id);
    dom.onclick = cb;
  }

  addAction('big', () => {
    const s = setting.scale + 0.1;
    if (s <= setting.maxScale) {
      setting.scale = s;
      createStyle();
    }
  });
  addAction('small', () => {
    const s = setting.scale - 0.1;
    if (s >= setting.minScale) {
      setting.scale = s;
      createStyle();
    }
  });

  const full = document.getElementById('full');
  full.onpointerdown = (ev) => {
    setting.enable = true;
    setting.x = ev.clientX;
    setting.y = ev.clientY;
  };
  full.onpointermove = (ev) => {
    if (setting.enable) {
      const offsetx = ev.clientX - setting.x;

      const offsety = ev.clientY - setting.y;

      const left = setting.left + offsetx;
      const top = setting.top + offsety;

      const s = setting.scale;
      const w = s * setting.w;
      const h = s * setting.h;
      //   console.log('move');
      if (left >= -w && left <= w && top >= -h && top <= h) {
        setting.left = left;
        setting.top = top;
        createStyle();

        setting.x = ev.clientX;
        setting.y = ev.clientY;
      }
    }
  };
  const mouseup = () => {
    setting.enable = false;
  };
  full.onpointerup = mouseup;
  document.body.onpointerup = mouseup;

  full.onwheel = (e) => {
    e.preventDefault();
    let size = setting.scale;
    if (e.wheelDelta < 0) {
      size -= 0.1;
    } else {
      size += 0.1;
    }
    if (size >= setting.minScale && size <= setting.maxScale) {
      setting.scale = size;
      createStyle();
    }
  };
});
