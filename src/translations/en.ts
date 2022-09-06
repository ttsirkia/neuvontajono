import { Translations } from "./translations";

export const en: Translations = {
  title: "Lab Session Queue",

  "index-jumbotron-1": "Lab Session Queue makes the queueing easy and fair.",
  "index-jumbotron-2":
    "When students need help, they can join the queue. They can see their real-time position in the queue and know that course assistants help students in the order they joined the queue.",
  "index-jumbotron-3":
    "Course assistants see the queue in real-time and always know who is the next student to help. Lab Session Queue also collects statistics about the number of participants in labs.",
  "index-lead": "Use Lab Session Queue by logging in via the learning management system.",

  "queue-current-position":
    "You are currently in the {position, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} place.",
  "queue-next-in-queue": "You are next.",
  "queue-not-open": "Queue is not currently open.",
  "queue-joined": "You are now in the queue.",
  "queue-join-failed": "Joining the queue failed.",
  "queue-multiple-locations": "There are multiple labs at the moment. Select the correct location.",
  "queue-group": "Lab session:",
  "queue-assistants": "Staff members:",
  "queue-current-length": "Queue length:",
  "queue-multiple-languages":
    "Course staff members speak multiple languages. Please select the language you would like to use.",
  "queue-language": "Language:",
  "queue-my-row": "My row:",
  "queue-row-direction-help": "The first row is in the front.",
  "queue-join": "Join Queue",
  "queue-leave-confirm": "Do you really want to leave the queue?",
  "queue-leave-confirmed": "You left the queue.",
  "queue-leave-failed": "Leaving the queue failed.",
  "queue-leave-reminder": "If you leave the lab or do not need help anymore, you can leave the queue.",
  "queue-leave": "Leave Queue",
  "queue-position-updated": "Location updated.",
  "queue-position-failed": "Updating location failed.",
  "queue-position-change": "If needed, you can update your location without losing your position in the queue.",
  "queue-move": "Move",
  "queue-lead":
    "In lab sessions you can ask for help from the course staff members. To make queueing fair, please join the queue when you need help and wait your turn.",
  "queue-local-participation": "I'll participate locally",
  "queue-remote-participation": "I'll participate remotely",
  "queue-wrong-call-url": "Video connection address must start with http:// or https://",
  "queue-call-url": "Video connection address:",
  "queue-call-url-help":
    "If there is a video conference tool in use (e.g. Zoom), you can paste here the address to join the call. If the field is empty, course staff members will see your email address.",
  "queue-remote": "Remotely",
  "queue-sign-up-required":
    "Before you can join the queue, you need to sign up to this lab session by clicking the button below.",
  "queue-sign-up": "Sign up",

  "manage-open-projector": "Open Projector View",
  "manage-projector-help":
    "Use the space key or click the participant name in the projector view to remove the participant from the queue. Most browsers open a full-screen view by pressing F11.",
  "manage-confirm-remove-middle": "Do you really want to remove a participant who is not in the first position?",
  "manage-remove-queue-failed": "Removing from the queue failed.",
  "manage-remove": "Remove from Queue",
  "manage-user-row-template": "{location}, in row {row}",
  "manage-clear-queue-confirm": "Do you really want to clear the queue?",
  "manage-clear-queue": "Clear Queue",
  "manage-th-position": "Position",
  "manage-th-name": "Name",
  "manage-th-entered-at": "Joined at",
  "manage-th-removed-at": "Removed at",
  "manage-th-location": "Location",
  "manage-current-length": "Queue length at the moment: {length, number}",
  "manage-recently-removed-title": "Recently removed",

  "manage-projector-conf-fail": "Loading the projector settings failed! Try to reload the page.",
  "manage-projector-queue-closed": "Queue is closed",
  "manage-projector-in-queue": "Queueing: ",
  "manage-projector-next-in-queue": "Next: ",
  "manage-projector-row": "row",

  "modify-create-title": "Create New Session",
  "modify-edit-title": "Edit Session",
  "modify-name": "Name:",
  "modify-name-help": 'The name can be, for example, "Mon 2-4 pm" or "S2".',
  "modify-location": "Location:",
  "modify-location-help":
    "If the lab is organized in the multiple locations at the same time and they share the same queue, use a comma to separate the locations.",
  "modify-staff": "Staff members:",
  "modify-staff-help": "Use a comma to separate the names. This field can be left empty.",
  "modify-language": "Language of instruction:",
  "modify-language-help":
    "Use a comma to separate the languages. This field can be left empty but if there are at least two languages, participants have to choose in which language they would like to get help.",
  "modify-weekday": "Weekday:",
  "modify-start-date": "Start date:",
  "modify-date-help": "Use the format 2021-03-01.",
  "modify-end-date": "End date:",
  "modify-in-use": "In use",
  "modify-in-use-help": "This setting can be used to temporarily disable the session.",
  "modify-start-time": "Start time:",
  "modify-time-help": "Use the format 2:15 pm or 14:15.",
  "modify-end-time": "End time:",
  "modify-queue-open-time": "Queue opens:",
  "modify-remote-method": "Method for remote participation:",
  "modify-remote-method-help":
    "Write here the method (for example Zoom) which the students will use to participate the session.",

  "select-no-groups-today": "No lab sessions today.",
  "select-main-text": "Choose the lab session. The table below lists all the labs today.",
  "select-th-name": "Name",
  "select-th-time": "Time",
  "select-th-staff": "Staff members",
  "select-th-location": "Location",
  "select-th-language": "Language",

  "sessions-additional-info": "More information about the lab sessions can be found <a>here</a>.",
  "sessions-modify-link": "You can edit the lab sessions in the <a>course settings</a>.",
  "sessions-main-text":
    "The table below lists all the lab sessions during this week. Labs with the green background are today.",

  "settings-title": "General Settings",
  "settings-sessions-title": "Lab Sessions",
  "settings-course-name": "Course name:",
  "settings-course-id": "Course id:",
  "settings-course-url": "Additional URL:",
  "settings-course-url-help":
    "Give a URL which contains more information about the labs. This field can be left empty.",
  "settings-combine": "Combine with:",
  "settings-combine-help":
    "If you want to combine multiple Lab Session Queues, write here the course id of the queue that will be used instead of this. All users except the course teacher will be redirected to that Lab Session Queue.",
  "settings-projector": "Video projector URL:",
  "settings-projector-help":
    "Define the video projector view by typing here the optional URL of the <a>configuration file</a>.",
  "settings-default-language": "Default UI language:",
  "settings-default-language-help":
    "This UI language will be used if the LTI authentication does not provide the user language.",
  "settings-statistics-visibility": "Visibility of statistics for participants",
  "settings-statistics-help":
    "This feature stores information about who has participated in which lab session. It is possible to disable this feature, and disabling it will remove all the stored data.",
  "settings-statistics-queue-visibility": "Visibility of statistics for queueing:",
  "settings-statistics-queue-help": "This feature does not collect any personal information.",
  "settings-statistics-graph-visibility": "Visibility of the queue length graph:",
  "settings-statistics-graph-help":
    "Regardless of the selected option, the queue length graph will be visible only if the user is able to see either of the previous statistics.",
  "settings-statistics--1": "Disable statistics",
  "settings-statistics-0": "Show for all",
  "settings-statistics-1": "Show only for course staff members",
  "settings-statistics-2": "Show only for the teacher",
  "settings-delete-confirm": "Do you really want to remove this lab session?",
  "settings-th-span": "Date",
  "settings-actions-help":
    "All lab sessions can be temporarily disabled when there is an exam period, for example. You can enable the sessions at anytime.",
  "settings-participation-policy": "Default participation policy:",
  "settings-participation-policy-0": "Course default",
  "settings-participation-policy-1": "Only locally",
  "settings-participation-policy-2": "Only remotely",
  "settings-participation-policy-3": "Locally or remotely",
  "settings-participation-policy-help":
    "This setting can be overridden for each session separately and will affect only those groups which use the course default policy.",
  "settings-session-participation-policy": "Participation policy:",
  "settings-require-sign-up": "Require to sign up in local lab sessions",
  "settings-require-sign-up-help":
    "If the setting is enabled, participants cannot join the queue without signing up first. This setting does not affect remote groups or if statistics are disabled below.",
  "settings-remote-help": "Help message for remote participation:",
  "settings-remote-help-help":
    "You can type here an instruction how to participate remotely. If defined, this will override the default help text and is shown after the possible course-defined help text.",
  "settings-remote-course-help":
    "You can type here an instruction how to participate remotely. If defined, this will override the default help text.",
  "settings-excluded-dates": "Excluded dates:",
  "settings-excluded-dates-help":
    "You can exclude single dates if the lab is not organized every week between the start and end date.",

  "statistics-most-active-title": "Most Active Participants",
  "statistics-most-active-info": "Only the course teacher can see this section.",
  "statistics-most-active-main": "The table lists how many times each student has participated in a lab session.",
  "statistics-th-active-position": "Position",
  "statistics-th-active-name": "Name",
  "statistics-th-active-visits": "Visits",
  "statistics-participant-count": "Number of participants",
  "statistics-participant-count-lead":
    "Statistics show how many participants there have been in the lab sessions. As the data is automatically collected, it may not be exact but should give an overview of which labs are usually crowded.",
  "statistics-queue-graph-lead":
    "You can see the graph of the queue length by hovering over the lab session you are interested of.",
  "statistics-queue-count": "Number of help requests",
  "statistics-queue-count-lead": "Statistics show the total number of how many times participants have requested help.",
  "statistics-median-queue-duration": "Median of the waiting time",
  "statistics-median-queue-duration-lead":
    "Statistics show how many minutes participants have been on average in the queue before getting help.",
  "statistics-maximum-queue-duration": "Maximum of the waiting time",
  "statistics-maximum-queue-duration-lead":
    "Statistics show the maximum number of minutes the participants have been in the queue before getting help.",
  "statistics-queue-graph": "Number of students in the queue",
  "statistics-session-participants-title": "Lab Session Participants",
  "statistics-session-participants-main":
    "You can search the participants of a specific lab session by selecting the session and entering the date.",
  "statistics-session-date": "Date:",
  "statistics-no-search-results": "The search did not return any participants.",

  save: "Save",
  cancel: "Cancel",
  select: "Select",
  edit: "Edit",
  delete: "Delete",
  create: "Create New",
  "enable-all": "Enable All",
  "disable-all": "Disable All",
  search: "Search",
  email: "Email",

  "weekdays-order": "0,1,2,3,4,5,6",
  "weekdays-short": "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
  "weekdays-long": "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
  "time-output-format": "h:mm aaa",
  "date-output-format": "LLL d, yyyy",
  "time-input-format": "h:mm aaa",
  "date-input-format": "yyyy-MM-dd",

  "ordinal-value": "{position, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",

  "alert-not-logged": "You are not logged in.",
  "alert-no-course": "You are not logged in for any course.",
  "alert-no-staff": "You are not a course staff member.",
  "alert-no-teacher": "You are not a teacher.",
  "alert-page-update-failed": "Updating failed. Try to reload the page.",
  "alert-session-not-found": "The lab session cannot be found.",
  "alert-clearing-queue-failed": "Clearing the queue failed.",
  "alert-session-saved": "Lab session is saved.",
  "alert-session-save-failed": "Saving the lab session failed.",
  "alert-settings-saved": "Course settings saved.",
  "alert-settings-save-failed": "Saving the course settings failed.",
  "alert-session-deleted": "Lab session is deleted.",
  "alert-session-delete-failed": "Deleting the lab session failed.",
  "alert-sessions-disabled": "Lab sessions are disabled.",
  "alert-sessions-disable-failed": "Disabling the lab sessions failed.",
  "alert-sessions-enabled": "Lab sessions are enabled.",
  "alert-sessions-enable-failed": "Enabling the lab sessions failed.",
  "alert-statistics-load-failed": "Loading the statistics failed.",
  "alert-statistics-no-permission": "You do not have permission to see the statistics.",
  "alert-loading-data-failed": "Loading data failed.",

  "notification-joined-queue-local": "{name} ({location}, row {row}) joined the queue.",
  "notification-joined-queue-remote": "{name} joined the queue.",
  "notification-no-permission": "Desktop notifications are not in use.",
  "notification-request-permission": "Give permission to activate notifications.",
  "notification-enabled":
    "Desktop notifications are enabled. You will get a notification when somebody joins the queue if it was empty.",
  "notification-disabled": "Desktop notifications are temporarily disabled.",
  "notification-activate": "Click here to activate",
  "notification-disable": "Click here to disable",

  "tabs-queue": "Join Queue",
  "tabs-sessions": "Lab Sessions",
  "tabs-statistics": "Statistics",
  "tabs-selectSession": "Manage Queue",
  "tabs-settings": "Course Settings",
};
