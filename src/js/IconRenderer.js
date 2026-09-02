import { getChartIconPath, getLocationIconPath, getNPCIconPath, getUIIconPath, getFeatureIconPath, getVehicleIconPath } from './iconPaths';

class IconRenderer {
  static createIconElement(value, size = 32) {
    if (!value.startsWith('/') && !value.startsWith('http')) {
      const span = document.createElement('span');
      span.textContent = value;
      span.style.fontSize = `${size}px`;
      return span;
    } else {
      const img = document.createElement('img');
      img.src = value;
      img.alt = 'icon';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.onerror = () => {
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontSize = `${size}px`;
        img.parentNode.replaceChild(span, img);
      };
      return img;
    }
  }

  static updateIconElement(element, value, size = 32) {
    if (!value.startsWith('/') && !value.startsWith('http')) {
      element.textContent = value;
    } else {
      const img = document.createElement('img');
      img.src = value;
      img.alt = 'icon';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.onerror = () => {
        element.textContent = value;
      };
      element.innerHTML = '';
      element.appendChild(img);
    }
  }

  static getLocationIconPath(id) {
    if (!id) {
      return '';
    }
    if (id.startsWith('/') || id.startsWith('http')) {
      return id;
    }
    return getLocationIconPath(id);
  }

  static getNPCIconPath(id) {
    return getNPCIconPath(id);
  }

  static getUIIconPath(id) {
    return getUIIconPath(id);
  }

  static getFeatureIconPath(id) {
    return getFeatureIconPath(id);
  }

  static getChartIconPath(id) {
    return getChartIconPath(id);
  }

  static getVehicleIconPath(id) {
    return getVehicleIconPath(id);
  }
}

export default IconRenderer;