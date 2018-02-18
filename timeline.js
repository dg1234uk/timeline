// TODO: Set up tests
// FIXME: zoom out and scroll time line, tiles drop off when still in view.
// Test Data
const DATA = [
  {
    id: 0,
    title: "tile1",
    startTime: new Date(Date.UTC(2018, 1, 13, 5, 0, 0)),
    endTime: new Date(Date.UTC(2018, 1, 13, 6, 0, 0))
  },
  {
    id: 1,
    title: "tile2",
    startTime: new Date(Date.UTC(2018, 1, 13, 8, 0, 0)),
    endTime: new Date(Date.UTC(2018, 1, 13, 10, 0, 0))
  },
  {
    id: 2,
    title: "tile3",
    startTime: new Date(Date.UTC(2018, 1, 13, 9, 30, 0)),
    endTime: new Date(Date.UTC(2018, 1, 13, 10, 30, 0))
  }
];

// Mins to pixels ratio
const scheduleState = {
  startTime: new Date(Date.UTC(2018, 1, 13, 7, 45, 0)),
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
  // const startTimeInMins = (scheduleState.startTime.getUTCHours() * 60) +
  //                         scheduleState.startTime.getUTCMinutes() +
  //                         (scheduleState.startTime.getUTCSeconds() / 60) +
  //                         (scheduleState.startTime.getUTCMilliseconds() / 60000);
  //
  //
  // const tileStartTimeInMins = (tileData.startTime.getUTCHours() * 60) +
  //                             tileData.startTime.getUTCMinutes() +
  //                             (tileData.startTime.getUTCSeconds() / 60) +
  //                             (tileData.startTime.getUTCMilliseconds() / 60000);
  //
  // const tileEndTimeInMins = (tileData.endTime.getUTCHours() * 60) +
  //                             tileData.endTime.getUTCMinutes() +
  //                             (tileData.endTime.getUTCSeconds() / 60) +
  //                             (tileData.endTime.getUTCMilliseconds() / 60000);

// difference from start time in ms
let left = tileData.startTime - scheduleState.startTime
let width = tileData.endTime - tileData.startTime
// if (left >= 0) {
//
// }

// to mins
left /= 60000;
width /= 60000;


  // convert minutes to pixels with the .zoom scale
  tilePos = {
    left: left * scheduleState.zoom,
    width: width * scheduleState.zoom,
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
    // difference from start time in ms
    const left = tileData.startTime - scheduleState.startTime
    const width = tileData.endTime - tileData.startTime
    const maxWidth = scheduleState.scheduleEndTime - scheduleState.startTime
    if (left + width >= 0 && left <= maxWidth) {
      const tileDiv = createTileElement(tileData, schedule);
      // Add tile to schedule
      schedule.appendChild(tileDiv);
    }
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
  // Convert UTC time in ms to mins
  const startTimeInMins = scheduleState.startTime.getTime() / 60000;

  // Get reference to timeline element
  const timeline = document.getElementById('timeline');

  timeline.innerHTML = "";

  // Convert pixel width of schedule to minutes using zoom (pixels:mins)
  const scheduleWidthMins = schedule.offsetWidth * scheduleState.zoom;

  // If first time is a whole hour place at 0px
  // otherwise offset by number of mins
  var startX;
  var time = new Date(scheduleState.startTime.getTime());
  if ((startTimeInMins % 60) === 0) {
    startX = 0;
    // - 2 hours becuase we will initally add an hour in the for loop and
    // the first time block is going to be an hour before the schedule start
    time.setUTCHours(time.getUTCHours() - 2, 0, 0, 0);
  } else {
    startX = (60 - (startTimeInMins % 60)) * scheduleState.zoom;
    time.setUTCHours(time.getUTCHours() - 1, 0, 0, 0);
  }

  // 60 minutes * schedule zoom
  const timeBlockWidth = 60 * scheduleState.zoom;

  // +timeBlockWidth to make enough room to add leading time 1hr before start
  const timelineWidth = timeline.offsetWidth + timeBlockWidth;

  // to ensure that only the remain time/width after the first whole hour after
  // scheduleState.startTime is used
  const timelineWidthAdjustedForStartX = timelineWidth - startX;

  // With the remain timeline width work out how many time blocks to create
  const numberOfTimeBlocks = timelineWidthAdjustedForStartX / timeBlockWidth;

  // Create a timeBlockElement for each
  for (let i = 0; i < numberOfTimeBlocks; i++) {
    time.setUTCHours(time.getUTCHours() + 1);
    const TimeBlockDiv = createTimeBlockElement(time, timeBlockWidth, startX);
    timeline.appendChild(TimeBlockDiv);
  }
  // Set the first timeblock margin to position entire timeline
  // - timeBlockWidth as start X is position of first schedule time
  // However, the first actual time (normally not visible) block is 1hr before.
  timeline.firstElementChild.style.marginLeft = `${startX - timeBlockWidth}px`;
}

function createTimeBlockElement(time, timeBlockWidth, startX) {
  // check time is a Date object
  if (!(time instanceof Date)) {
    throw new Error(`time is not time`);
  }

  // Convert pixel width of schedule to minutes using zoom (pixels:mins)
  const scheduleWidthMins = schedule.offsetWidth * scheduleState.zoom;

  // Create a div and add its css class
  const tbDiv = document.createElement('div');
  tbDiv.className = 'timeBlock';

  // Format the hours and minutes strings to display
  var hours, minutes;
  if (time.getUTCHours() < 10) {
    hours = `0${time.getUTCHours()}`;
  } else {
    hours = time.getUTCHours();
  }

  if (time.getUTCMinutes() < 10) {
    minutes = `0${time.getUTCMinutes()}`;
  } else {
    minutes = time.getUTCMinutes();
  }

  // Set the width, calculated in renderTimeline()
  tbDiv.style.width = `${timeBlockWidth}px`;

  // Create spans with repestive classes for hours and minutes
  // Append them to the timeBlock div
  const hoursSpan = document.createElement('span');
  hoursSpan.className = 'hours';
  hoursSpan.innerText = hours;
  const minutesSpan = document.createElement('span');
  minutesSpan.className = 'minutes';
  minutesSpan.innerText = minutes;
  tbDiv.appendChild(hoursSpan);
  tbDiv.appendChild(minutesSpan);

  return tbDiv;
}

// Globals for dragging
let lastXPos, dragging;

// Add listeners for mouse, touch and wheel (could use new pointer events)
schedule.addEventListener('mousedown', onMouseDown, false);
schedule.addEventListener('touchstart', onTouchStart, false);
schedule.addEventListener('wheel', onWheelEvent, false);

// wheel event handler. simply scroll by the wheel delta
function onWheelEvent(e) {
  e.preventDefault();
  scrollSchedule(e.deltaX)
}


// Only if left mouse is pressed. Start drag and set up 'ending drag' events
function onMouseDown(e) {
  if (e.button === 0) {
    lastXPos = e.offsetX;
    dragging = true;
    schedule.addEventListener('mousemove', onMouseDrag, false);
    window.addEventListener('mouseup', stopDrag, false);
  }
}

function onMouseDrag(e) {
  if (dragging) {
    scrollSchedule(lastXPos - (e.pageX - timeline.offsetLeft));
    lastXPos = e.pageX - timeline.offsetLeft;
  }
}

function stopDrag(e) {
  dragging = false;
  document.removeEventListener('mousemove', onMouseDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function onTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    lastXPos = e.touches[0].clientX;
    dragging = true;
    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchend', onTouchEnd, false);
    document.addEventListener('touchcancel', onTouchEnd, false)
  }
}

function onTouchMove(e) {
  event.preventDefault();
  if (dragging && e.touches.length === 1) {
    scrollSchedule(lastXPos - (e.touches[0].pageX - timeline.offsetLeft));
    lastXPos = e.pageX - timeline.offsetLeft;
  }
}

function onTouchEnd(e) {
  event.preventDefault();
	if(event.touches.length === 0){
		dragging = false;
		document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchEnd);
	}
}

function scrollSchedule(dx=0) {
  const currentMins = scheduleState.startTime.getUTCMinutes();
  scheduleState.startTime.setUTCMinutes(currentMins + dx);
  render();
}
