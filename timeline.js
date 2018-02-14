// Test Data
const DATA = [
  {
    id: 0,
    title: "tile1",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 0, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 0, 0))
  },
  {
    id: 1,
    title: "tile2",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 0, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 0, 0))
  },
  {
    id: 2,
    title: "tile3",
    startTime: new Date(Date.UTC(18, 2, 13, 9, 30, 0)),
    endTime: new Date(Date.UTC(18, 2, 13, 10, 30, 0))
  }
];

// Mins to pixels ratio
const scheduleState = {
  startTime: new Date(Date.UTC(18, 2, 13, 8, 0, 0)),
  zoom: 1
}

const settings = {
  tileMargin: 10,
  tileHeight: 20,
  tileTop: 20
};

// Get reference to timeline
const timeline = document.getElementById("timeline");

// Set up event handlers
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

btnZoomIn.addEventListener('click', btnZoomInHandler, false);
btnZoomOut.addEventListener('click', btnZoomOutHandler, false);

renderTimeline();

function setScheduleEndTime(scheduleState, timeline) {
  if (scheduleState.hasOwnProperty('zoom') === false) {
    throw new Error(`scheduleState does not have zoom property`);
  }
  if (scheduleState.hasOwnProperty('startTime') === false) {
    throw new Error(`scheduleState does not have startTime property`);
  }
  // Check if timeline is a HTMLElement
  if (!(timeline instanceof HTMLElement)) {
    throw new Error('timeline is not an HTMLCollection');
  }

  // Convert pixel width of timeline to minutes using zoom (pixels:mins)
  // debugger;
  const scheduleWidthMins = timeline.offsetWidth * scheduleState.zoom;
  // Set scheduleEndTime to start time then add scheduleWidthMins to get end time
  let scheduleEndTime = new Date(scheduleState.startTime);
  // Need to convert scheduleWidthMins to milliseconds, add, create new date.
  scheduleEndTime = new Date(scheduleEndTime.getTime() + new Date(scheduleWidthMins * 60000).getTime());

  return scheduleEndTime;
}

function createTileElement(tileData, timeline) {
  // Check tileData has the properties expected
  if (
    tileData.hasOwnProperty('id') === false ||
    tileData.hasOwnProperty('title') === false ||
    tileData.hasOwnProperty('startTime') === false ||
    tileData.hasOwnProperty('endTime') === false
  ) {
    throw new Error(`tileData (id:${tileData.id}) object does not have required properties`);
  }
  // Check if timeline is a HTMLElement
  if (!(timeline instanceof HTMLElement)) {
    throw new Error('timeline is not an HTMLCollection');
  }
  // check times are Date objects
  if (!(tileData.startTime instanceof Date) || !(tileData.endTime instanceof Date)) {
    throw new Error(`tileData (id:${tileData.id}) expected Date object for time`);
  }

  const tileDiv = document.createElement("div");
  tileDiv.className = "tile";

  // Time to minutes
  const startTimeInMins = (scheduleState.startTime.getUTCHours() * 60) +
                          scheduleState.startTime.getUTCMinutes() +
                          (scheduleState.startTime.getUTCSeconds() / 60) +
                          (scheduleState.startTime.getUTCMilliseconds() / 60000);


  const tileStartTimeInMins = (tileData.startTime.getUTCHours() * 60) +
                              tileData.startTime.getUTCMinutes() +
                              (tileData.startTime.getUTCSeconds() / 60) +
                              (tileData.startTime.getUTCMilliseconds() / 60000);

  const tileEndTimeInMins = (tileData.endTime.getUTCHours() * 60) +
                              tileData.endTime.getUTCMinutes() +
                              (tileData.endTime.getUTCSeconds() / 60) +
                              (tileData.endTime.getUTCMilliseconds() / 60000);

  // convert minutes to pixels with the .zoom scale
  tilePos = {
    left: (tileStartTimeInMins - startTimeInMins) * scheduleState.zoom,
    width: (tileEndTimeInMins - tileStartTimeInMins) * scheduleState.zoom,
    height: settings.tileHeight,
    top: settings.tileTop
  };

  // Collision Detection of tile
  const timelineChildren = timeline.children;
  for (let element of timelineChildren) {
    if (
      element.offsetLeft < tilePos.left + tilePos.width &&
      element.offsetLeft + element.offsetWidth > tilePos.left &&
      element.offsetTop < tilePos.top + tilePos.height &&
      element.offsetTop + element.offsetHeight > tilePos.top
    ) {
      // Move conflicting tile down
      tilePos.top += element.offsetHeight + settings.tileMargin;
    }
    // collision detected!
    tileDiv.style.top = `${tilePos.top}px`;
  }

  // Set content & tile div absolute positions
  tileDiv.dataset.id = tileData.id;
  tileDiv.innerText = tileData.title;
  tileDiv.style.left = `${tilePos.left}px`;
  tileDiv.style.width = `${tilePos.width}px`;
  tileDiv.style.height = `${tilePos.height}px`;
  tileDiv.style.top = `${tilePos.top}px`;

  return tileDiv;
}

function renderTimeline() {
  // Clear timeline
  timeline.innerHTML = "";

  // Save to scheduleState
  scheduleState.scheduleEndTime = setScheduleEndTime(scheduleState, timeline);

  // Create div for each data
  for (let tileData of DATA) {
    const tileDiv = createTileElement(tileData, timeline);
    // Add tile to timeline
    timeline.appendChild(tileDiv);
  }
}

function btnZoomInHandler(e) {
  scheduleState.zoom += 0.1;
  renderTimeline();
}

function btnZoomOutHandler(e) {
  scheduleState.zoom -= 0.1;
  // Ensure zoom doesn't go less than 0.1 to avoid display issues
  if (scheduleState.zoom < 0.1) {
    scheduleState.zoom = 0.1;
  }
  renderTimeline();
}
