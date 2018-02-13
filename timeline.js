// Test Data
const data = [
  {
    'title': 'tile1',
    'startTime': '2',
    'endTime': '4'
  },
  {
    'title': 'tile2',
    'startTime': '2',
    'endTime': '4'
  },
  {
    'title': 'tile3',
    'startTime': '2',
    'endTime': '7'
  }
];

const settings = {
  'tileHeight': 20,
  'tileMargin': 10,
}

// Get reference to timeline div
const timeline = document.getElementById('timeline');

// Clear Timeline
timeline.innerText = '';

// Loop through data and create and position tile for each
for (tileData of data) {
  // Check tileData has required properties
  if (
    (tileData.hasOwnProperty('title') === false) ||
    (tileData.hasOwnProperty('startTime') === false) ||
    (tileData.hasOwnProperty('endTime') === false)
  ) {
    throw new Error('tileData object does not have expected properties')
  }

  const div = document.createElement('div');

  // Set div to default tile style
  div.className = 'tile';

  // Set tile title
  div.innerText = tileData.title;

  // Tile collision detection vertical resolve
  timelineChildren = timeline.children;

  // startTime to pixels relative to timeline div
  const startTimePixels = tileData.startTime * 10;
  div.style.left = `${startTimePixels}px`;

  // Duration to pixels
  const durationPixels = (tileData.endTime - tileData.startTime) * 15
  div.style.width = `${durationPixels}px`;

  // Set tile height
  const tileHeight = settings.tileHeight;
  div.style.height = `${tileHeight}px`;
  // Set defualt top value, will be adjusted by collision detection if conflict
  const defaultTop = 20;
  let divTop = defaultTop;
  // Collision detection, must be after div left and width have been set
  for (element of timelineChildren) {
    // console.log('element', element);
    // console.log('div', div);
    if (element === div) {
      console.log('ELEMENT and DIV are equal OMG 🙀');
    }
    // AABB collision detection between divs
    if (
      element.offsetLeft < startTimePixels + durationPixels &&
      element.offsetLeft + element.offsetWidth > startTimePixels &&
      element.offsetTop < divTop + tileHeight &&
      element.offsetTop + element.offsetHeight > divTop
    ) {
      // console.log('collision');
      // Resolve collision by adding height of div collided with + margin
      divTop += element.offsetHeight + settings.tileMargin
      // recursively call collision detection to redect? Not sure!?!
    }
  }
  div.style.top = `${divTop}px`;

  // Add tile div to timeline.
  timeline.appendChild(div);
}
