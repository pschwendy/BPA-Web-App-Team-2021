var socket = io();
var username = "USER";

var app =  new function() {


    this.el = document.getElementById('tasks');
    this.tasks = [];
    this.times = [];
    this.dates = [];
    this.combinedArray = [];
   
    
    //S();

    this.FetchAll = function () { // Takes all of our tasks and displays them
        this.combinedArray = [];
        for (i = 0; i < this.tasks.length; i++ ) {
            var taskTime = {
                theTask: this.tasks[i],
                theTime: this.times[i],
                theDate: this.dates[i]
            }

            this.combinedArray.push(taskTime);
        }
        console.log("dates: ");
        console.log(this.dates);

        document.getElementById('edit-box').style.display = 'none';
        let data = '';

        if (this.times.length > 1) {
            this.sortTime();
        } 

        if (this.tasks.length > 0) {
            for (i = 0; i < this.tasks.length; i++) {
                data += '<tr>'; //adds table row
                data += '<td>' + (i+1) + '. ' + this.combinedArray[i].theTask + '</td>'; //adds table cell so it says the task number then the task info i.e 3. Eat lunch
                data += '<td>' + this.combinedArray[i].theTime + '</td>';
                data += '<td>' + this.combinedArray[i].theDate +'</td>';
                data += '<td> <button onclick = "app.Edit('+i+')" class = "btn btn-warning" > Edit </button> </td>'; // adds edit button
                data += '<td> <button onclick = "app.Delete('+i+')" class = "btn btn-danger"> Delete </button> </td';
                data += '</tr>'
            }
        }

        this.Count(this.tasks.length);
        return this.el.innerHTML = data;
    };

    this.Add = function () { //adds a task
        var elTask = document.getElementById('add-todo');
        var elTime = document.getElementById('add-time');
        var elDate = document.getElementById('add-date');
        var task = elTask.value;
        var time = elTime.value;
        var date = elDate.value;

        if (task && time) {
            this.tasks.push(task.trim());
            this.times.push(time);
            var convertedDate = convertDate(date);
            this.dates.push(convertedDate);
            console.log(this.times);
            socket.emit("addTask", [task, time, username]);
       //     this.timesOfDays.push(timeOfDay);
            elTask.value = '';
            document.getElementById('add-time').value = '';
            this.FetchAll();
        }
        document.getElementById('output').innerHTML = convertedDate;
    };

    this.Edit = function(item) {  //edits task
        var elTask = document.getElementById('edit-todo');
        var elTime = document.getElementById('edit-time');
        var elDate = document.getElementById('edit-date');

        elTask.value = this.tasks[item];
        elTime.value = this.times[item];
        elDate.value = this.dates[item];
        document.getElementById('edit-box').style.display = 'block'; //defaults to close, displays it.
        self = this;

        document.getElementById('save-edit').onsubmit = function() {
            var task = elTask.value;
            var time = elTime.value;
            var date = elDate.value;

            if (task && time && checkTime(time)) {
                self.tasks.splice(item, 1, task.trim());
                self.times.splice(item, 1, time);
                var convertedDate = convertDate(date);
                self.dates.splice(item, 1, convertedDate);
                self.FetchAll();
                CloseInput();
            }
        }
    };

    this.Delete = function (item) { //deletes element
        this.tasks.splice(item, 1);
        this.times.splice(item, 1);
        this.dates.splice(item, 1);
        this.FetchAll();
    };

    this.Count = function(data) { //counts and displays elemetnts
        let el = document.getElementById('counter');
        let name = 'Tasks';
        if (data) {
            if (data == 1) {
                name = 'Task';
            }
            el.innerHTML = data + ' ' + name;
        }
        else {
            el.innerHTML = "No " + name;``
        }
    }



    this.sortTime = function () {

        this.combinedArray.sort(function(el1, el2) {

            date1 = el1.theDate;
            date2 = el2.theDate;

            date1Obj = {
                year: date1[6] + date1[7] + date1[8] + date1[9],
                month: date1[3]+ date1[4],
                day: date1[0] + date1[1]
            }

            date2Obj = {
                year: date2[6] + date2[7] + date2[8] + date2[9],
                month: date2[3]+ date2[4],
                day: date2[0] + date2[1]
            }

            var day1 = parseInt(date1Obj.day);
            var month1 = parseInt(date1Obj.month);
            var year1 = parseInt(date1Obj.year);
            var day2 = parseInt(date2Obj.day);
            var month2 = parseInt(date2Obj.month);
            var year2 = parseInt(date2Obj.year);

            if (year1 > year2) {return 1;}
            if (year2 > year1) {return -1;}
            if (month1 > month2) {return 1;}
            if (month2 > month1) {return -1;}
            if (day1 > day2) {return 1;}
            if (day2 > day1) {return -1;}

        });
        

        this.combinedArray.sort(function(el1, el2) {

            var time1 = el1.theTime;
            var time2 = el2.theTime;

            if (time1.length === 4) {
            var x = time1[0] + time1[2] + time1[3];
            }
            else {
            var x = time1[0] + time1[1] + time1[3] + time1[4];
            }

            if (time2.length === 4) {
            var y = time2[0] + time2[2] + time2[3];
            }
            else {
            var y = time2[0] + time2[1] + time2[3] + time2[4];
            }

            e = parseInt(x, 10);
            f = parseInt(y, 10);

            if (e>f) {return 1;}
            if (f>e) {return -1;}
            return 0

        });


    }
}

function convertDate(date) {
    var convertedDate =  date[5] + date[6] + date[7] +  date[8] + date[9] + date[4] + date[0] + date[1] + date[2] + date[3] ;
    return convertedDate;
}

app.FetchAll(); //fetches all by default

function CloseInput() { //closes edit box
    document.getElementById('edit-box').style.display = 'none';
}

function checkTime(time) {
    time.replace(/\s+/g, '');
    if (time.length  === 4) {
        time = "0" + time;
    }
    if (isDigit(time[0]) && isDigit(time[1]) && time[2] === ':' && isDigit(time[3]) && isDigit(time[4])
     && time.length === 5 ) {
        return true;
    }
    return false;
}

function isDigit(charr) {
    if (charr === '0') {return true;}
    if (charr === '1') {return true;}
    if (charr === '2') {return true;}
    if (charr === '3') {return true;}
    if (charr === '4') {return true;}
    if (charr === '5') {return true;}
    if (charr === '6') {return true;}
    if (charr === '7') {return true;}
    if (charr === '8') {return true;}
    if (charr === '9') {return true;}
    return false;
}





window.onload = function(){


  var cookieData = document.cookie;
  username = cookieData.slice(cookieData.indexOf("name=") + 5, cookieData.length);

  //change this to user id or whatever else is used to identify users
  socket.emit("getTaskData", username);



}

socket.on("getTaskData", function(msg){


  for (task of msg){
    app.tasks.push(task.task);
    app.times.push(task.time);
  }

  app.FetchAll();

});

