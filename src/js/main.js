import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Constants from './constants.js';
import { add } from 'three/tsl';

// Constants for reusable values
const MINESKIN_API_URL = Constants.MINESKIN_API_URL;
const NON_MATERIAL_ITEMS = Constants.NON_MATERIAL_ITEMS;
const NON_LEVEL_ENCHANTMENTS = Constants.NON_LEVEL_ENCHANTMENTS;
const ENCHANTMENT_INCOMPATIBILITIES = Constants.ENCHANTMENT_INCOMPATIBILITIES;
const MINECRAFT_DYE_COLORS = Constants.MINECRAFT_DYE_COLORS;
const OLD_FORMAT_TO_NEW = Constants.OLD_FORMAT_TO_NEW;
const OVERLAY_REGIONS = Constants.OVERLAY_REGIONS;
const NON_VISIBLE = Constants.NON_VISIBLE;
const enchantedObjects = [];

// Load JSON data and generate enchantment buttons
let jsonItems, jsonEnchantments;
fetch('src/assets/data/data.json')
  .then(response => response.json())
  .then(data => {
    jsonItems = data.items;
    jsonEnchantments = data.enchantments;
    generateEnchantmentButtons(); // Generate enchantment buttons after loading JSON
    preLoadDocument();
  })
  .catch(error => console.error('Error loading JSON file:', error));



// ================ 3D Model Setup ================
const modelDiv = document.getElementById('model-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, modelDiv.clientWidth / modelDiv.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(modelDiv.clientWidth, modelDiv.clientHeight);
modelDiv.appendChild(renderer.domElement);

const gltfLoader = new GLTFLoader();
let object;

// Load initial placeholder model
gltfLoader.load('src/assets/models/wide_model.gltf', (gltf) => {
  object = gltf.scene;

  scene.add(object);

  // Set up OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 3.2;
  controls.target.set(0, 1, 0);
  controls.update();
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 4;
  controls.enablePan = false;
  loadSkin('test'); // Load initial skin
});

camera.position.set(-0.65, 1.7, -1.50);
scene.add(new THREE.AmbientLight(0x404040, 20));

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  Object.entries(enchantedObjects).forEach(([itemType, enchantedObject]) => {
    if (enchantedObject.isEnchanted) {
      const speed = 0.0005; // Adjust the speed of the animation
      enchantedObject.enchantedTexture.offset.x += speed / 6; // Move horizontally
      enchantedObject.enchantedTexture.offset.y += speed; // Move vertically
    }
  });
  
  

  renderer.render(scene, camera);
}


// ================ Load a new skin ================
async function loadSkin(username) {
  try {
    // Load and transform the skin image
    const skinURL = `${MINESKIN_API_URL}${username}`;
    const transformedImageURL = await loadAndTransformImage(skinURL);

    // Load the texture using the transformed image URL
    const texture = await loadTexture(transformedImageURL);

    // Apply the texture to the object's materials
    applyTextureToObject(object, texture);
  } catch (error) {
    console.error('Error loading skin texture:', error);
  }
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

function applyTextureToObject(object, texture) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
}

async function loadAndTransformImage(url) {
  let image = await IJS.Image.load(url);

  // Function to load a model and return a promise
  const loadModel = (modelPath) => {
    return new Promise((resolve, reject) => {
      gltfLoader.load(modelPath, (gltf) => {
        object = gltf.scene;
        scene.add(object);
        resolve();
      }, undefined, (error) => {
        reject(error);
      });
    });
  };

  // Check for wide or narrow model
  for (let y = 20; y <= 31; y++) {
    const pixel = image.getPixelXY(54, y);
    if (pixel[3] !== 0) {
      scene.remove(object);
      await loadModel('src/assets/models/wide_model.gltf'); // Load wide model
    } else {
      scene.remove(object);
      await loadModel('src/assets/models/slim_model.gltf'); // Load slim model
    }
  }

  // Check if image is 64x64 or 64x32
  if (image.width === 64 && image.height === 64) {
  } else if (image.width === 64 && image.height === 32) {
    image = Convert6432To6464(image);
  }

  const rotated = image.rotate(180); // Rotate 180 degrees
  const flipped = rotated.flipX(); // Flip horizontally
  return flipped.toDataURL(); // Convert to data URL
}

// Track loaded models
let lastLoadedItem, lastLoadedHelmet, lastLoadedChestplate, lastLoadedLeggings, lastLoadedBoots;

// Load enchanted texture
const textureLoader = new THREE.TextureLoader();
const enchantedTexture = textureLoader.load('src/assets/img/enchanted.png');
enchantedTexture.wrapS = THREE.RepeatWrapping;
enchantedTexture.wrapT = THREE.RepeatWrapping;
enchantedTexture.magFilter = THREE.LinearFilter;
enchantedTexture.minFilter = THREE.LinearFilter;
enchantedTexture.repeat.set(0.35, 0.35); // Zoom in

// Load and unload models
function loadModel(item, material) {
  const itemData = jsonItems[item];
  const finalMaterial = itemData.materials === null ? item : material;
  const modelPath = `src/assets/models/${itemData.type}/${item}/${finalMaterial}.gltf`;

  gltfLoader.load(modelPath, (gltf) => {
    const objectToLoad = gltf.scene;
    const { rotation, position } = itemData.model;

    objectToLoad.rotation.set(rotation.x, rotation.y, rotation.z);
    objectToLoad.position.set(position.x, position.y, position.z);

    unloadModel(item);
    if (item === 'helmet') lastLoadedHelmet = objectToLoad;
    else if (item === 'chestplate') lastLoadedChestplate = objectToLoad;
    else if (item === 'leggings') lastLoadedLeggings = objectToLoad;
    else if (item === 'boots') lastLoadedBoots = objectToLoad;
    else lastLoadedItem = objectToLoad;

    if (finalMaterial === 'leather') {
      applyColorToArmor(objectToLoad, document.getElementById('color-selector').value);
    }

    addEnchantedObject(objectToLoad, item);
    const anyEnchantmentsSelected = document.querySelectorAll('.enchantment.selected').length > 0;
    toggleEnchantedEffect(item, anyEnchantmentsSelected);



    scene.add(objectToLoad);
  });
}

function unloadModel(item) {
  if (item === 'helmet') scene.remove(lastLoadedHelmet);
  else if (item === 'chestplate') scene.remove(lastLoadedChestplate);
  else if (item === 'leggings') scene.remove(lastLoadedLeggings);
  else if (item === 'boots') scene.remove(lastLoadedBoots);
  else scene.remove(lastLoadedItem);
}

// Example: Add objects to the enchanted state manager
function addEnchantedObject(object, itemType) {
  enchantedObjects[itemType] = ({
    object: object,
    enchantedTexture: enchantedTexture,
    isEnchanted: false // Default state
  });
}

function toggleEnchantedEffect(itemType, isEnchanted) {
  const enchantedObject = enchantedObjects[itemType].object;
  enchantedObjects[itemType].isEnchanted = isEnchanted;

  // Apply or remove the enchanted texture
  enchantedObject.traverse((child) => {
    if (child.isMesh) {
      if (isEnchanted) {
        child.material.emissiveMap = enchantedTexture;
        child.material.emissive = new THREE.Color(0xffffff);
        child.material.emissiveIntensity = 1;
      } else {
        child.material.emissiveMap = null;
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
      }
      child.material.needsUpdate = true;
    }
  });

}



animate();
// ================ Event Listeners ================

// Item buttons
document.querySelectorAll('.button-grid button').forEach(button => {
  button.addEventListener('click', () => handleItemButtonClick(button));
});

// Material buttons
document.querySelectorAll('.material-buttons-container button').forEach(button => {
  button.addEventListener('click', () => handleMaterialButtonClick(button));
});

// Leather armor color selector
document.getElementById('color-selector').addEventListener('change', (event) => {
  handleColorChange(event);
})

// Enchantment buttons & level buttons
// Added when generating enchantment buttons

// Equip checkbox
document.getElementById('equipedCheckbox').addEventListener('change', handleEquipCheckboxChange);

// Toggle Stats/Model button
document.getElementById('toggle-button').addEventListener('click', toggleStatsAndModel);

// Full screen stats button
document.getElementById('stats-content-fullscreen').addEventListener('click', toggleFullScreenStats);

// Equip item buttons
document.querySelectorAll('.equipItemButton').forEach(button => {
  button.addEventListener('click', () => handleEquipItemButtonClick(button));
});

// Open settings button
document.querySelector('.settings-button').addEventListener('click', openSettings);

// Close settings button
document.getElementById('close-settings').addEventListener('click', closeSettings);

// Save settings button
document.getElementById('save-settings').addEventListener('click', saveSettings);

// Overlay click
document.getElementById('settings-overlay').addEventListener('click', closeSettings);

// Custom skin text input when input text presses enter load skin
const customSkinUsername = document.getElementById('customSkinInput');
customSkinUsername.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadSkin(customSkinUsername.value);
  }
})

// Navigation arrows
document.querySelectorAll('.nav-arrow').forEach(button => {
  button.addEventListener('click', () => handleNavButtonClick(button));
});

// Window resize event listener
window.addEventListener('resize', handleResize);


// ================ Event Handlers ================

function handleItemButtonClick(button) {
  const hideEnchantmentsPlaceholder = document.getElementById('enchantment-placeholder');
  const hideMaterialsPlaceholder = document.getElementById('material-placeholder');
  const hideMaterialsNotApplied = document.getElementById('material-not-applied');

  hideEnchantmentsPlaceholder.hidden = true;
  hideMaterialsPlaceholder.style.display = 'none';
  hideMaterialsNotApplied.hidden = true;

  document.querySelectorAll('.enchantments button').forEach(el => {
    el.hidden = true;
  });
  document.querySelectorAll('.material-buttons-container button').forEach(el => {
    el.style.display = 'none';
  });

  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    hideEnchantmentsPlaceholder.hidden = false;
    hideMaterialsPlaceholder.style.display = 'flex';
    return;
  }

  // Higlight selected button
  document.querySelectorAll('.button-grid button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');

  // Set selected item materials and enchantments
  const itemData = jsonItems[button.id];
  itemData.enchantments.forEach(enchantment => {
    document.getElementById(enchantment).hidden = false
  })
  if (itemData.materials) {
    itemData.materials.forEach(material => document.getElementById(material).style.display = 'flex');
  } else {
    hideMaterialsNotApplied.hidden = false;
  }

  if (window.innerWidth <= 768) {
    document.getElementById('right-arrow').click();
  }

  updateItemDataDisplay();
}

function handleMaterialButtonClick(button) {
  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    document.getElementById('equipedCheckbox').disabled = true;
    document.getElementById('equipedCheckbox').checked = false;
    const currentSelectedItemImg = document.querySelector('.button-grid button.selected img');
    currentSelectedItemImg.src = currentSelectedItemImg.src.replace(/[^/]+$/, `placeholder.png`);
    updateItemData();
    unloadModel(document.querySelector('.button-grid button.selected').id);
    if (button.id === 'leather') {
      document.querySelector('.color-dropdown-container').hidden = true;
      const currentSelectedLeatherColor = document.getElementById('color-selector').value;
      document.getElementById('color-selector').value = currentSelectedLeatherColor === null ? 'undyed' : currentSelectedLeatherColor;
      document.getElementById('color-selector').disabled = true;
    }
    return;
  }

  document.querySelectorAll('.material-buttons-container button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  document.getElementById('equipedCheckbox').disabled = false;

  if (document.getElementById('equipedCheckbox').checked) {
    const currentSelectedItemImg = document.querySelector('.button-grid button.selected img');
    currentSelectedItemImg.src = currentSelectedItemImg.src.replace(/[^/]+$/, `${button.id}.png`);

    const currentSelectedItem = document.querySelector('.button-grid button.selected');
    loadModel(currentSelectedItem.id, button.id);
  }

  if (button.id === 'leather') {
    document.querySelector('.color-dropdown-container').hidden = false;
  } else {
    document.querySelector('.color-dropdown-container').hidden = true;
  }

  updateItemData();
}

function handleColorChange(event) {
  const color = event.target.value;
  const currentSelectedItem = document.querySelector('.button-grid button.selected');

  if (currentSelectedItem.id === 'helmet') {
    applyColorToArmor(lastLoadedHelmet, color);
  } else if (currentSelectedItem.id === 'chestplate') {
    applyColorToArmor(lastLoadedChestplate, color);
  } else if (currentSelectedItem.id === 'leggings') {
    applyColorToArmor(lastLoadedLeggings, color);
  } else if (currentSelectedItem.id === 'boots') {
    applyColorToArmor(lastLoadedBoots, color);
  }

  updateItemData();
}

function handleEnchantmentButtonClick(button) {
  const incompatibleEnchantments = ENCHANTMENT_INCOMPATIBILITIES[button.id];

  if (button.classList.contains('selected')) {
    button.classList.remove('selected');

    if (incompatibleEnchantments) {
      incompatibleEnchantments.forEach(incompatibleEnchantment => {
        document.getElementById(incompatibleEnchantment).disabled = false;
      });
    }

    updateItemData();
    return;
  }

  button.classList.add('selected');

  if (incompatibleEnchantments) {
    incompatibleEnchantments.forEach(incompatibleEnchantment => {
      document.getElementById(incompatibleEnchantment).disabled = true;
    });
  }

  updateItemData();
}

function handleEquipCheckboxChange(event) {
  const currentSelectedItemImg = document.querySelector('.button-grid button.selected img');
  const currentSelectedMaterial = document.querySelector('.material-buttons-container button.selected');
  const currentSelectedItem = document.querySelector('.button-grid button.selected');
  const colorDropdown = document.getElementById('color-selector');

  if (event.target.checked) {
    if (NON_MATERIAL_ITEMS.includes(currentSelectedItem.id)) {
      currentSelectedItemImg.src = currentSelectedItemImg.src.replace(/[^/]+$/, `${currentSelectedItem.id}.png`);
      loadModel(currentSelectedItem.id, currentSelectedMaterial?.id || '');

      const showEquipItemButton = document.getElementById(`equip_${currentSelectedItem.id}`);
      if (showEquipItemButton) showEquipItemButton.style.display = 'flex';
    } else {
      currentSelectedItemImg.src = currentSelectedItemImg.src.replace(/[^/]+$/, `${currentSelectedMaterial.id}.png`);
      loadModel(currentSelectedItem.id, currentSelectedMaterial.id);

      const showEquipItemButton = document.getElementById(`equip_${currentSelectedItem.id}`);
      if (showEquipItemButton) showEquipItemButton.style.display = 'flex';
    }

    if (currentSelectedMaterial?.id === 'leather') colorDropdown.disabled = false;

  } else {
    currentSelectedItemImg.src = currentSelectedItemImg.src.replace(/[^/]+$/, `placeholder.png`);
    unloadModel(currentSelectedItem.id);

    const showEquipItemButton = document.getElementById(`equip_${currentSelectedItem.id}`);
    if (showEquipItemButton) showEquipItemButton.style.display = 'none';
    if (currentSelectedMaterial?.id === 'leather') colorDropdown.disabled = true;
  }

  updateItemData();
}

function toggleStatsAndModel() {
  const statsContent = document.getElementById('stats-content');
  const modelContent = document.getElementById('model-container');
  const equipButtonContent = document.querySelector('.selectEquipedItem');

  statsContent.style.display = statsContent.style.display === 'none' ? 'block' : 'none';
  modelContent.style.display = modelContent.style.display === 'none' ? 'block' : 'none';
  equipButtonContent.style.display = equipButtonContent.style.display === 'none' ? 'flex' : 'none';
  this.textContent = statsContent.style.display === 'none' ? 'Show Stats' : 'Show 3D Model';
}

function handleLevelButtonClick(event, button) {
  event.stopPropagation();
  const parentDiv = button.parentElement;

  if (parentDiv.parentElement.classList.contains('selected')) {
    const parentDivLevelButtons = parentDiv.querySelectorAll('.enchantmentLevel');
    parentDivLevelButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    updateItemData();
  }
}

function handleEquipItemButtonClick(button) {
  console.log("é aqui?");
  const itemId = button.id.replace('equip_', '');
  let material = null;

  if (itemId === 'pickaxe' || itemId === 'shovel' || itemId === 'axe' || itemId === 'hoe') {
    material = itemData[itemId].material;
  }


  loadModel(itemId, material);
}

// ================ Helper Functions ================

const itemData = {};

function updateItemData() {
  const currentSelectedItem = document.querySelector('.button-grid button.selected');
  const currentSelectedMaterial = document.querySelector('.material-buttons-container button.selected');
  const currentSelectedEnchantments = document.querySelectorAll('.enchantments button.selected');
  const currentSelectedIsEquipped = document.getElementById('equipedCheckbox').checked;
  const currentSelectedLeatherColor = document.getElementById('color-selector').value;

  itemData[currentSelectedItem.id] = {
    material: currentSelectedMaterial ? currentSelectedMaterial.id : null,
    leatherColor: currentSelectedMaterial?.id === 'leather' && currentSelectedIsEquipped ? currentSelectedLeatherColor : null,
    enchantments: Array.from(currentSelectedEnchantments).map(enchantment => ({
      id: enchantment.id,
      level: NON_LEVEL_ENCHANTMENTS.includes(enchantment.id) ? 1 : parseInt(enchantment.querySelector('.selected').textContent)
    })),
    isEquiped: currentSelectedIsEquipped
  };
}

function updateItemDataDisplay() {
  // Clear all selected classes from materials & enchantments
  document.querySelectorAll('.material-buttons-container button, .enchantments button').forEach(button => {
    button.classList.remove('selected');
    button.disabled = false;
  });

  // Reset all enchantment levels to 1
  document.querySelectorAll('.enchantmentLevel').forEach(button => {
    if (button.textContent === '1') button.classList.add('selected');
    else button.classList.remove('selected');
  });

  // Reset leather color and hide
  const colorDropdown = document.getElementById('color-selector');
  colorDropdown.value = 'undyed';
  colorDropdown.disabled = true;
  document.querySelector('.color-dropdown-container').hidden = true;

  const equipedCheckbox = document.getElementById('equipedCheckbox');
  equipedCheckbox.checked = false;
  equipedCheckbox.disabled = true;

  const currentSelectedItem = document.querySelector('.button-grid button.selected');
  if (!itemData[currentSelectedItem.id]) {
    if (NON_MATERIAL_ITEMS.includes(currentSelectedItem.id)) {
      equipedCheckbox.disabled = false;
    }
    return;
  }

  const currentSelectedMaterial = itemData[currentSelectedItem.id].material;
  const currentSelectedEnchantments = itemData[currentSelectedItem.id].enchantments;
  const currentSelectedIsEquipped = itemData[currentSelectedItem.id].isEquiped;
  const currentSelectedLeatherColor = itemData[currentSelectedItem.id].leatherColor;

  if (currentSelectedMaterial) {
    const materialButton = document.getElementById(currentSelectedMaterial);
    materialButton.classList.add('selected');
    equipedCheckbox.disabled = false;

    if (currentSelectedMaterial === 'leather') {
      document.querySelector('.color-dropdown-container').hidden = false;
      document.getElementById('color-selector').value = currentSelectedLeatherColor === null ? 'undyed' : currentSelectedLeatherColor;
      colorDropdown.disabled = currentSelectedIsEquipped ? false : true;
    }
  }

  if (currentSelectedEnchantments.length > 0) {
    currentSelectedEnchantments.forEach(enchantment => {
      const enchantmentButton = document.getElementById(enchantment.id);
      enchantmentButton.classList.add('selected');

      const incompatibleEnchantments = ENCHANTMENT_INCOMPATIBILITIES[enchantment.id];
      if (incompatibleEnchantments) {
        incompatibleEnchantments.forEach(incompatibleEnchantment => {
          document.getElementById(incompatibleEnchantment).disabled = true;
        });
      }

      const enchantmentLevels = enchantmentButton.querySelectorAll('.enchantmentLevel');
      enchantmentLevels.forEach(level => {
        if (level.textContent == enchantment.level) level.classList.add('selected');
        else level.classList.remove('selected');
      });
    });
  }

  equipedCheckbox.checked = currentSelectedIsEquipped;
  if (NON_MATERIAL_ITEMS.includes(currentSelectedItem.id)) {
    equipedCheckbox.disabled = false;
  }
}

// Generate enchantment and level buttons in HTML
function generateEnchantmentButtons() {
  const enchantmentsContainer = document.querySelector('.enchantments');

  // Loop through the enchantments in the JSON data
  Object.keys(jsonEnchantments).forEach(itemKey => {
    const enchantment = jsonEnchantments[itemKey];
    const enchantmentLevels = enchantment.levels;

    const button = document.createElement('button');
    button.id = itemKey;
    button.className = 'enchantment';
    button.hidden = true; // Initially hidden
    button.textContent = itemKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    const levelSelector = document.createElement('div');
    levelSelector.className = 'levelSelector';
    if (enchantmentLevels === 1) { levelSelector.classList.add('hidenLevel'); }
    for (let i = 1; i <= enchantmentLevels; i++) {
      const levelButton = document.createElement('span');
      levelButton.className = 'enchantmentLevel';
      levelButton.textContent = i;
      if (i === 1) levelButton.classList.add('selected'); // Default to level 1
      levelSelector.appendChild(levelButton);
    }
    button.appendChild(levelSelector);

    enchantmentsContainer.appendChild(button);
  });

  // Add event listeners for dynamically generated enchantment and level buttons
  document.querySelectorAll('.enchantment').forEach(button => {
    button.addEventListener('click', () => handleEnchantmentButtonClick(button));
  });

  document.querySelectorAll('.enchantmentLevel').forEach(button => {
    button.addEventListener('click', (event) => handleLevelButtonClick(event, button));
  });
}

// Settings related functions
function openSettings() {
  document.getElementById('settings-overlay').style.display = 'block';
  document.getElementById('settings-popup').style.display = 'block';
}

function closeSettings() {
  document.getElementById('settings-overlay').style.display = 'none';
  document.getElementById('settings-popup').style.display = 'none';
}

function saveSettings() {
  closeSettings();
}

// Function to convert a 64x32 texture image to a 64x64 texture
function Convert6432To6464(image) {
  // Create a new 64x64 image with transparent background
  const newImage = new IJS.Image(64, 64);

  // Copy the original 64x32 image to the top half of the new image
  for (let x = 0; x < 64; x++) {
    for (let y = 0; y < 32; y++) {
      newImage.setPixelXY(x, y, image.getPixelXY(x, y));
    }
  }

  // Helper function to copy a region from the old image to the new image
  const copy = (srcX, srcY, width, height, destX, destY, flip = false) => {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pixel = image.getPixelXY(srcX + x, srcY + y);
        newImage.setPixelXY(destX + (flip ? width - 1 - x : x), destY + y, pixel);
      }
    }
  };

  // Convert old format to new format
  OLD_FORMAT_TO_NEW.forEach(({ sx, sy, w, h, dx, dy, flip }) => copy(sx, sy, w, h, dx, dy, flip));

  clearNonVisible(newImage);
  FixOverlay(newImage);
  return newImage;
}

// Function to check if a region has transparency
const HasTransparency = (image, x, y, width, height) => {
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      if (image.getPixelXY(i, j)[3] === 0) return true;
    }
  }
  return false;
};

// Function to clear a rectangular region in the image
const clearRect = (image, x, y, width, height) => {
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      image.setPixelXY(i, j, [0, 0, 0, 0]);
    }
  }
};

const clearNonVisible = (image) => {
  NON_VISIBLE.forEach(({ x, y, width, height }) => clearRect(image, x, y, width, height));
};

// Function to fix blacked overlay regions
const FixOverlay = (image) => {
  OVERLAY_REGIONS.forEach(({ front, top, bottom, right, left, back }) => {
    if (!HasTransparency(image, front.x, front.y, front.width, front.height)) {
      [top, bottom, right, left, back].forEach(({ x, y, width, height }) => {
        if (!HasTransparency(image, x, y, width, height)) {
          clearRect(image, x, y, width, height);
        }
      });
      clearRect(image, front.x, front.y, front.width, front.height);
    }
  });
};

// Function to trigger a download to be used in the future
function downloadImage(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Change leather armor color
function applyColorToArmor(object, colorName) {
  object.traverse((child) => {
    if (child.isMesh) {
      const material = child.material;
      if (material.map) {
        material.color = new THREE.Color(MINECRAFT_DYE_COLORS[colorName]);
        material.needsUpdate = true;
      }
    }
  });
}

function applyEnchantedTexture(object, enchantedTexture) {
  object.traverse((child) => {
    if (child.isMesh) {
      const material = child.material;

      // Apply the purple tint to the base color
      const tintColor = new THREE.Color(0.9, 0.8, 1.0); // Light purple
      const tintIntensity = 0.9; // Adjust this value to control the strength of the tint
      material.color.lerp(tintColor, tintIntensity); // Blend the original color with the tint

      // Set the enchanted texture as the emissive map
      material.emissiveMap = enchantedTexture;
      material.emissive = new THREE.Color(0xffffff); // Set emissive color to white
      material.emissiveIntensity = 1; // Adjust the intensity of the glow

      // Ensure the material is updated
      material.needsUpdate = true;
    }
  });
}

// Pre-load document
function preLoadDocument() {
  document.getElementById('helmet').click();
}

// Navigation
let currentTitle = 2;
const divLeft = document.getElementById('left');
const divMiddle = document.getElementById('middle');
const divRight = document.getElementById('right');
const NAV_TITLES = ['ITEMS', 'CUSTOMIZATION', 'PREVIEW'];
const NAV_TITLES_DIV = [divLeft, divMiddle, divRight];

function handleNavButtonClick(button) {

  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');

  if (button.id === 'left-arrow' && currentTitle > 0) {
    currentTitle--;
  } else if (button.id === 'right-arrow' && currentTitle < 2) {
    currentTitle++;
  }

  NAV_TITLES_DIV.forEach((div, index) => {
    if (index === currentTitle) {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
    if (currentTitle === 0) {
      leftArrow.classList.add('disabled');
    } else if (currentTitle === 2) {
      rightArrow.classList.add('disabled');
    } else {
      leftArrow.classList.remove('disabled');
      rightArrow.classList.remove('disabled');
    }
  });

  document.getElementById('nav-title').textContent = NAV_TITLES[currentTitle];
}

function handleResize() {
  if (window.innerWidth > 768) {
    document.getElementById('left').style.display = 'block';
    document.getElementById('middle').style.display = 'block';
    document.getElementById('right').style.display = 'block';
    console.log('window width is greater than 768px')
  } else {
    NAV_TITLES_DIV.forEach((div, index) => {
      if (index === currentTitle) {
        div.style.display = 'block';
      } else {
        div.style.display = 'none';
      }
    })
  }
}

function toggleFullScreenStats() {
  const statsContent = document.getElementById("stats-content");
  const fullscreenIcon = document.getElementById("fullscreen-icon");

  fullscreenIcon.src = statsContent.classList.contains("fullscreen")
    ? "src/assets/svg/fullscreen-open.svg"
    : "src/assets/svg/fullscreen-close.svg";

  document.getElementById("stats-content").classList.toggle("fullscreen");
}
// ================ Zona de testes ================

