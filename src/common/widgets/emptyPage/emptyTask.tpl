{{#hasNewTaskBtn}}
<div class="task-empty" data-type="all">
	<div class="task-empty-inner">
		<div><i class="icon-flag"></i></div>
		<div><span>{{lang.noTask}}</span></div>
		<div><button data-log='{"actionTag":"taskListEmptyNewTask"}'>{{lang.createTask}}</button></div>
	</div>
</div>
{{/hasNewTaskBtn}}

{{^hasNewTaskBtn}}
<div class="task-empty">
	<div class="task-empty-inner">
		<div><i class="icon-flag-null"></i></div>
		<div><span>{{lang.noTaskNotCreate}}</span></div>
	</div>
</div>
{{/hasNewTaskBtn}}