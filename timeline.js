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
    startTime: new Date(Date.UTC(18, 2, 13, 8, 0, 0)),
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
  startTime: new Date(Date.UTC(18, 2, 13, 7, 30, 0)),
  zoom: 1
}

const settings = {
  tileMargin: 10,
  tileHeight: 20,
  tileTop: 20
};

// Get reference to schedule
const schedule = document.getElementById('schedule');

// Set up event handlers
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

btnZoomIn.addEventListener('click', btnZoomInHandler, false);
btnZoomOut.addEventListener('click', btnZoomOutHandler, false);

render();

function render() {
  renderSchedule();
  renderTimeline();
}

function setScheduleEndTime(scheduleState, schedule) {
  if (scheduleState.hasOwnProperty('zoom') === false) {
    throw new Error(`scheduleState does not have zoom property`);
  }
  if (scheduleState.hasOwnProperty('startTime') === false) {
    throw new Error(`scheduleState does not have startTime property`);
  }
  // Check if schedule is a HTMLElement
  if (!(schedule instanceof HTMLElement)) {
    throw new Error('schedule is not an HTMLCollection');
  }

  // Convert pixel width of schedule to minutes using zoom (pixels:mins)
  const scheduleWidthMins = schedule.offsetWidth * scheduleState.zoom;
  // Set scheduleEndTime to start time then add scheduleWidthMins to get end time
  let scheduleEndTime = new Date(scheduleState.startTime);
  // Need to convert scheduleWidthMins to milliseconds, add, create new date.
  scheduleEndTime = new Date(scheduleEndTime.getTime() + new Date(scheduleWidthMins * 60000).getTime());

  return scheduleEndTime;
}

function createTileElement(tileData, schedule) {
  // Check tileData has the properties expected
  if (
    tileData.hasOwnProperty('id') === false ||
    tileData.hasOwnProperty('title') === false ||
    tileData.hasOwnProperty('startTime') === false ||
    tileData.hasOwnProperty('endTime') === false
  ) {
    throw new Error(`tileData (id:${tileData.id}) object does not have required properties`);
  }
  // Check if schedule is a HTMLElement
  if (!(schedule instanceof HTMLElement)) {
    throw new Error('schedule is not an HTMLCollection');
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
  const scheduleChildren = schedule.children;
  for (let element of scheduleChildren) {
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

function renderSchedule() {
  // Clear schedule
  schedule.innerHTML = "";

  // Save to scheduleState
  scheduleState.scheduleEndTime = setScheduleEndTime(scheduleState, schedule);

  // Create div for each data
  for (let tileData of DATA) {
    const tileDiv = createTileElement(tileData, schedule);
    // Add tile to schedule
    schedule.appendChild(tileDiv);
  }
}

function btnZoomInHandler(e) {
  scheduleState.zoom += 0.1;
  render();
}

function btnZoomOutHandler(e) {
  scheduleState.zoom -= 0.1;
  // Ensure zoom doesn't go less than 0.1 to avoid display issues
  if (scheduleState.zoom < 0.1) {
    scheduleState.zoom = 0.1;
  }
  render();
}

function renderTimeline() {
  // TODO: More like initiate timeline, rather than render sliding update
  // TODO: Clear contents and make a div for each time to cover width
  const startTimeInMins = (scheduleState.startTime.getUTCHours() * 60) +
                          scheduleState.startTime.getUTCMinutes() +
                          (scheduleState.startTime.getUTCSeconds() / 60) +
                          (scheduleState.startTime.getUTCMilliseconds() / 60000);


  const timeline = document.getElementById('timeline');

  timeline.innerHTML = "";

  // Convert pixel width of schedule to minutes using zoom (pixels:mins)
  const scheduleWidthMins = schedule.offsetWidth * scheduleState.zoom;

  // If first time is a whole hour place at 0 otherwise offset by number of mins
  const startX = (startTimeInMins % 60) * scheduleState.zoom;

  // 60 minutes * schedule zoom
  const timeBlockWidth = 60 * scheduleState.zoom;

  const timelineWidth = timeline.offsetWidth;

  const numberOfTimeBlocks = timelineWidth / timeBlockWidth;

  // debugger;
  for (let i = 0; i < numberOfTimeBlocks; i++) {
    const time = new Date(scheduleState.startTime.getTime() + (i * 60 * 60 * 1000))
    var isFirst = false;
    if (i === 0) {
      isFirst = true;
    }
    const tileBlockDiv = createTileBlockElement(time, timeBlockWidth, startX, isFirst);
    timeline.appendChild(tileBlockDiv);
  }
}

function createTileBlockElement(time, timeBlockWidth, startX, isFirst) {
  // check time is a Date object
  if (!(time instanceof Date)) {
    throw new Error(`time is not time`);
  }
  if (typeof isFirst !== 'boolean') {
    throw new Error(`isFirst should be type boolean`);
  }

  // Convert pixel width of schedule to minutes using zoom (pixels:mins)
  const scheduleWidthMins = schedule.offsetWidth * scheduleState.zoom;


  const tbDiv = document.createElement('div');
  tbDiv.className = 'timeBlock';
  var hours;
  if (time.getUTCHours() < 10) {
    hours = `0${time.getUTCHours()}`;
  } else {
    hours = time.getUTCHours();
  }
  // TODO: Add hours and minutes to their respective SPANs
  tbDiv.innerText = `${hours}${time.getUTCMinutes()}`;
  tbDiv.style.width = `${timeBlockWidth}px`;

  if (isFirst) {
    tbDiv.style.marginLeft = `${startX}px`;
  }

  return tbDiv;
}
