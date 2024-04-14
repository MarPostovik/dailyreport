// Function to format date from yyyy-mm-dd to Month day, year format
function formatDate(inputDate) {
    return inputDate ? new Date(inputDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
}

// Function to convert time from 24-hour format to 12-hour format
function convertTo12HourFormat(time24) {
    return time24 ? new Date('1970-01-01T' + time24 + 'Z').toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : 'Not selected';
}

let ReportDate;
let name;
let YesterdayDate;
let TodayDate;
let blockers;

const submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', function(e){
    e.preventDefault();
    ReportDate = formatDate(document.getElementById('date').value);
    name = document.getElementById('name').value;
    YesterdayDate = formatDate(document.getElementById('yesterday-date').value);
    TodayDate = new Date().toISOString().slice(0, 10); // Get today's date
    blockers = document.getElementById('blockers').value;
});

function addTask(taskContainerId) {
    const taskContainer = document.getElementById(taskContainerId);
    const taskCount = taskContainer.querySelectorAll('.tasks__item').length + 1;

    const newTask = document.createElement('li');
    newTask.classList.add('tasks__item');
    newTask.innerHTML = `
        <div>
            <textarea name="" class="task-description" cols="40" rows="5">Task ${taskCount} description</textarea>
        </div>
        <label for="task-deadline">Deadline:</label> <input type="date" class="task-deadline">
        <p>Priority:</p>
        <div class="priority">
            <input type="radio" name="priority-${taskContainerId}-${taskCount}" value="High"/>
            <label>High</label>
            <input type="radio" name="priority-${taskContainerId}-${taskCount}" value="Medium" checked />
            <label>Medium</label>
            <input type="radio" name="priority-${taskContainerId}-${taskCount}" value="Low" />
            <label>Low</label>
        </div>
    `;

    taskContainer.appendChild(newTask);
}

function addMeeting(meetingContainerId) {
    const meetingContainer = document.getElementById(meetingContainerId);
    const meetingCount = meetingContainer.querySelectorAll('.report__meeting').length + 1;

    const newMeeting = document.createElement('li');
    newMeeting.classList.add('report__meeting');
    newMeeting.innerHTML = `
        <label for="meeting-person">Name and Position / Team</label>
        <input type="text" class="meeting-person" placeholder="Attendee ${meetingCount}"> 
        <label for="meeting-cst">Time CST:</label>
        <input type="time" class="meeting-cst">
        <label for="meeting-eet">Time EET:</label>
        <input type="time" class="meeting-eet">
        ${meetingContainerId.includes('yesterday') ? `
            <textarea name="" class="meeting-brief" cols="40" rows="3">Meeting ${meetingCount} brief</textarea>
        ` : ''}
    `;

    meetingContainer.appendChild(newMeeting);
}

async function sendMessage() {
  
  const webhookUrl = "https://discord.com/api/webhooks/1228352371961368597/KRc9w1rJcpHujyHJn9y95Q0Es0TNOrwnKGfHJklKcu8fDp8EYZnR2-wVF6aWePptCh52"; 
  // const webhookUrl = "https://discord.com/api/webhooks/1227299910970249429/KPJ-NfB2aqT53rlifmw4e9z7nwEV-HwHRWANNc-olwhiDuyhjtZjmE5BgB7eUZAwnGut"; my server

  const payload = {
    username: `${name}`,
    content: `📅 Date: ${ReportDate} \n\n✅What I did yesterday ${YesterdayDate}:\n\n${getTasksInfo('yesterdayTasks')}👥Met with: \n${getMeetingsInfo('yesterdayMeetings')}📌What I will do today:\n\n${getTasksInfo('todayTasks')}👥Meeting with:\n${getMeetingsInfo('todayMeetings')}\n⛔️Blockers: ${blockers}\n[Documentation on daily reports](https://docs.google.com/document/d/11sqd6GyqTMoch-a5z6dAFRVII0nmgxj_m1EeZ2yNVQY/edit#heading=h.ac36khbgswt8)`,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

function getTasksInfo(taskContainerId) {
    const taskContainer = document.getElementById(taskContainerId);
    const taskItems = taskContainer.querySelectorAll('.tasks__item');
    let tasksInfo = '';
    taskItems.forEach((task, index) => {
        const taskDescriptionInput = task.querySelector('.task-description');
        const taskDescription = taskDescriptionInput.value.trim() || `Task ${index + 1} description`;
        const taskDeadlineInput = task.querySelector('.task-deadline');
        const taskDeadline = formatDate(taskDeadlineInput.value) || 'Not selected';

        const taskPriorityRadios = task.querySelectorAll(`input[name="priority-${taskContainerId}-${index + 1}"]:checked`);
        let taskPriority = 'Not selected';
        if (taskPriorityRadios.length > 0) {
            taskPriority = taskPriorityRadios[0].value;
        }

        tasksInfo += `- ${taskDescription}\n> Deadline: ${taskDeadline}\n> Priority: ${taskPriority}\n\n`;
    });
    return tasksInfo;
}

function getMeetingsInfo(meetingContainerId) {
    const meetingContainer = document.getElementById(meetingContainerId);
    const meetingItems = meetingContainer.querySelectorAll('.report__meeting');
    let meetingsInfo = '';
    meetingItems.forEach((meeting, index) => {
        const attendeeName = meeting.querySelector('.meeting-person').value || `Attendee ${index + 1}`;
        const meetingCST = meeting.querySelector('.meeting-cst').value || '';
        const meetingEET = meeting.querySelector('.meeting-eet').value || '';
        const meetingBrief = meeting.querySelector('.meeting-brief')?.value || '';
        const timeCST = meetingCST ? convertTo12HourFormat(meetingCST) : 'Not selected';
        const timeEET = meetingEET ? convertTo12HourFormat(meetingEET) : 'Not selected';
        meetingsInfo += `${attendeeName} 🕒 ${timeCST}, CST / ${timeEET}, EET\n${meetingBrief ? `> ${meetingBrief}\n\n` : ''}`;
    });
    return meetingsInfo;
}