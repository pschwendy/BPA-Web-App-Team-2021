var app =  new function() {
    this.el = document.getElementById('tasks');
    this.tasks = []

    this.FetchAll = function () { // Takes all of our tasks and displays them
        let data = '';

        if (this.tasks.length > 0) {
            for (i = 0; i < this.tasks.length; i++) {
                data += '<tr>'; //adds table row
                data += '<td>' + (i+1) + '. ' + this.tasks[i] + '</td>'; //adds table cell so it says the task number then the task info i.e 3. Eat lunch
                data += '<td> <button onclick = "app.Edit('+i+')" class = "btn btn-warning" > Edit </button> </td>'; // adds edit button
                data += '<td> <button onclick = "app.Delete('+i+')" class = "btn btn-danger"> Delete </button> </td';
                data += '</tr>'
            }
        }
        
        this.Count(this.tasks.length);
        return this.el.innerHTML = data;
    };
    
    this.Add = function () { //adds a task
        el = document.getElementById('add-todo');
        let task = el.value;
        if (task) {
            this.tasks.push(task.trim());
            el.value = '';
            this.FetchAll();
        }
    };

    this.Edit = function(item) {  //edits task
        el = document.getElementById('edit-todo');
        el.value = this.tasks[item];
        document.getElementById('edit-box').style.display = 'block'; //defaults to close, displays it.
        self = this;
        

        document.getElementById('save-edit').onsubmit = function() {
            var task = el.value;
            if (task) {
                self.tasks.splice(item, 1, task.trim());
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

}

app.FetchAll(); //fetches all by default

function CloseInput() { //closes edit box
    document.getElementById('edit-box').style.display = 'none';
}