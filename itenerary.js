var socket = io();
var username = "USER";

var app =  new function() {


    this.el = document.getElementById('tasks');
    this.tasks = [];
    this.times = [];
    var sortedTimes = [];
    var sortedTasks = [];
    
    //S();

    this.FetchAll = function () { // Takes all of our tasks and displays them

        sortedTimes = this.times;
        sortedTasks = this.tasks;

        document.getElementById('edit-box').style.display = 'none';
        let data = '';

        if (this.times.length > 1) {
            this.sortTime();

        } 

        if (this.tasks.length > 0) {
            for (i = 0; i < this.tasks.length; i++) {
                data += '<tr>'; //adds table row
                data += '<td>' + (i+1) + '. ' + sortedTasks[i] + '</td>'; //adds table cell so it says the task number then the task info i.e 3. Eat lunch
                data += '<td>' + sortedTimes[i] + '</td>';
                data += '<td> <button onclick = "app.Edit('+i+')" class = "btn btn-warning" > Edit </button> </td>'; // adds edit button
                data += '<td> <button onclick = "app.Delete('+i+')" class = "btn btn-danger"> Delete </button> </td';
                data += '</tr>'
            }
        }

        this.Count(this.tasks.length);
        return this.el.innerHTML = data;
    };

    this.Add = function () { //adds a task
        elTask = document.getElementById('add-todo');

        let elTime = document.getElementById('add-time');
        console.log(elTime.value)
        let task = elTask.value;
        let time = elTime.value;

        if (task && time) {
            this.tasks.push(task.trim());
            this.times.push(time);
            console.log(this.times);
            socket.emit("addTask", [task, time, username]);
       //     this.timesOfDays.push(timeOfDay);
            elTask.value = '';
            document.getElementById('add-time').value = '';
            this.FetchAll();
        }
    };

    this.Edit = function(item) {  //edits task
        elTask = document.getElementById('edit-todo');
        let elTime = document.getElementById('edit-time');

        elTask.value = this.tasks[item];
        elTime.value = this.times[item];
        document.getElementById('edit-box').style.display = 'block'; //defaults to close, displays it.
        self = this;


        document.getElementById('save-edit').onsubmit = function() {
            var task = elTask.value;
            let time = elTime.value;
            if (task && time && checkTime(time)) {

                self.tasks.splice(item, 1, task.trim());
                self.times.splice(item, 1, time);
                self.FetchAll();
                CloseInput();
            }
        }
    };

    this.Delete = function (item) { //deletes element
        this.tasks.splice(item, 1);
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

        sortedTimes.sort(function(a, b) {



            if (a.length === 4) {
            var x = a[0] + a[2] + a[3];
            }
            else {
            var x = a[0] + a[1] + a[3] + a[4];
            }

            if (b.length === 4) {
            var y = b[0] + b[2] + b[3];
            }
            else {
            var y = b[0] + b[1] + b[3] + b[4];
            }

            e = parseInt(x, 10);
            f = parseInt(y, 10);

            sortedTasks.sort(function (a,b) {
                if (e>f) {return 1;}
                if (f>e) {return -1;}
                return 0 ;
            });

            if (e>f) {return 1;}
            if (f>e) {return -1;}
            return 0

        });


    }
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
