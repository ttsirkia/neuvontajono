# Statistics

It depends on the course settings which of these statistics are visible for
which user groups. By default, only the number of participants is visible for
all.

![Statistics](statistics.png)

## Number of participants

The number of participants counts the total number of the participants. It
doesn't change the value if a same student requests help multiple times, each
student is always counted only once. If it is mandatory to sign up, also these
students are counted.

In case that student doesn't get help in the session in which they originally
joined the queue, the student will be counted as a participant in two sessions:
in the session in which they joined the queue and in the session in which they
got help.

## Maximum of the Waiting Time

This value reports the maximum waiting time in minutes in each lab session.

## Number of Help Requests

This value reports the number of help requests in total in each lab session. If
the same user requests help multiple times, all of these are counted as a
separate help request.

## Median of the Waiting Time

This value reports the median waiting time in each lab session.

## The Colors of the Cells

The color of the cell is defined in the following way. First all the values are
sorted to be in order. The values which cover the range from 0 % to 75 % of the
values (75 % means the value in the sorted list with index which is the length
of the list \* 0.75) will be green. Values between 75 % and 90 % are orange and
values between 90 % and 100 % are red.

## Graph of the Queue Length

By hovering over each cell in the table, you will see a graph which will show in
the x-axis the time and y-axis the number of students in the queue at that time.
The resolution is two minutes and the graph shows always the maximum queue
length within that two-minute slice.

## Most Active Participants

:information_source: This view is always available only for teachers.

This section contains a list of all participants and the number in how many lab
sessions they have participated.

## Lab Session Participants

:information_source: This view is always available only for teachers.

This section can be used to fetch a list of participants in a specific lab
session. Select the correct lab session and date and click Search. You will get
a list of names, the locations in which they participated and email address.
