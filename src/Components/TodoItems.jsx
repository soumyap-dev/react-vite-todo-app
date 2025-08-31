import './CSS/TodoItems.css'
import tick from './Assets/tick.png'
import not_tick from './Assets/not_tick.png'
import cross from './Assets/cross.png'

export const TodoItems = ({no,display,text,setTodos,category,priority,estimatedDuration,dueDate}) => {

    const deleteTodo = () => {
        let data = JSON.parse(localStorage.getItem("todos")) || [];
        data = data.filter((todo) => todo.no!==no);
        setTodos(data);
    }

const toggle = (no) =>{
    let data = JSON.parse(localStorage.getItem("todos")) || [];
    for(let i = 0;i < data.length;i++)
    {
      if(data[i].no===no){
        if(data[i].display===""){
            data[i].display = "line-through";
        }
        else
        {
            data[i].display = "";
        }
        break;
      }
    }
    setTodos(data);
}


    // Priority colors
    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'HIGH': return '#e74c3c';
            case 'MEDIUM': return '#f39c12';
            case 'LOW': return '#2ecc71';
            default: return '#95a5a6';
        }
    };

  return (
    <div className='todoitems'>
        <div className={`todoitems-container ${display}`} onClick={() => toggle(no)}>
            {display===""?<img src={not_tick} alt="" />:<img src={tick} alt="" />}
            <div className="todoitems-content">
                <div className="todoitems-text">{text}</div>
                <div className="todoitems-ai-info">
                    {category && (
                        <span className="ai-category" style={{backgroundColor: category.color}}>
                            {category.name}
                        </span>
                    )}
                    {priority && (
                        <span className="ai-priority" style={{color: getPriorityColor(priority)}}>
                            {priority.toLowerCase()} priority
                        </span>
                    )}
                    {estimatedDuration && (
                        <span className="ai-duration">⏱️ {estimatedDuration}</span>
                    )}
                    {dueDate && (
                        <span className="ai-due-date">📅 {dueDate}</span>
                    )}
                </div>
            </div>
        </div>
        <img className='todoitems-cross-icon' onClick={()=>{deleteTodo(no)}} src={cross} alt="" />
    </div>
  )
}
