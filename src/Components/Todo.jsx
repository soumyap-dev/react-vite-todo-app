import { useEffect, useRef, useState } from 'react'
import './CSS/Todo.css'
import { TodoItems } from './TodoItems';
import { 
    categorizeTask, 
    suggestPriority, 
    estimateTaskDuration, 
    extractDueDate, 
    generateSmartSuggestions,
    analyzeProductivityPatterns,
    getProductivityInsights
} from './aiUtils';

// AI Insights Dashboard Component
const AIInsightsDashboard = ({ todos }) => {
    const analysis = analyzeProductivityPatterns(todos);
    const insights = getProductivityInsights(analysis);
    
    return (
        <div className="ai-dashboard">
            <h3>📊 Productivity Analytics</h3>
            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-number">{analysis.totalTasks}</span>
                    <span className="stat-label">Total Tasks</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{analysis.completedTasks}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{analysis.completionRate}%</span>
                    <span className="stat-label">Success Rate</span>
                </div>
            </div>
            
            {insights.length > 0 && (
                <div className="insights-section">
                    <h4>🧠 AI Insights</h4>
                    {insights.map((insight, index) => (
                        <div key={index} className="insight-item">{insight}</div>
                    ))}
                </div>
            )}
            
            {Object.keys(analysis.categories).length > 0 && (
                <div className="categories-section">
                    <h4>📂 Task Categories</h4>
                    {Object.entries(analysis.categories).map(([category, data]) => (
                        <div key={category} className="category-stat">
                            <span className="category-name">{category}</span>
                            <span className="category-progress">
                                {data.completed}/{data.total} completed
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


let count = 0;
export const Todo = () => {

    const [todos,setTodos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const inputRef = useRef(null);

    const add = () => {
        const taskText = inputRef.current.value.trim();
        if (!taskText) return;
        
        // AI-powered enhancements
        const category = categorizeTask(taskText);
        const priority = suggestPriority(taskText);
        const duration = estimateTaskDuration(taskText);
        const dueDate = extractDueDate(taskText);
        
        const newTodo = {
            no: count++,
            text: taskText,
            display: "",
            category: category,
            priority: priority,
            estimatedDuration: duration,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };
        
        setTodos([...todos, newTodo]);
        
        // Generate smart suggestions
        const smartSuggestions = generateSmartSuggestions(taskText, todos);
        setSuggestions(smartSuggestions);
        
        inputRef.current.value = "";
        localStorage.setItem("todos_count", count);
    }

    // Handle input changes for real-time suggestions
    const handleInputChange = () => {
        const taskText = inputRef.current.value.trim();
        if (taskText.length > 3) {
            const smartSuggestions = generateSmartSuggestions(taskText, todos);
            setSuggestions(smartSuggestions.slice(0, 3)); // Show top 3 suggestions
        } else {
            setSuggestions([]);
        }
    };

    // Add suggestion to input
    const addSuggestion = (suggestion) => {
        inputRef.current.value = suggestion;
        setSuggestions([]);
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            add();
        }
    };

    useEffect(()=>{
        const savedTodos = localStorage.getItem("todos");
        const savedCount = localStorage.getItem("todos_count");
        
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }
        if (savedCount) {
            count = parseInt(savedCount);
        }
    },[])

    useEffect(()=>{
        setTimeout(() => {
            console.log(todos);
            localStorage.setItem("todos",JSON.stringify(todos));
        }, 100)
    },[todos])

  return (
    <div className='todo'>
        <div className="todo-header">
            🤖 AI-Powered To-Do List
            <button 
                className="ai-insights-btn"
                onClick={() => setShowAIInsights(!showAIInsights)}
            >
                {showAIInsights ? 'Hide' : 'Show'} AI Insights
            </button>
        </div>
        
        {showAIInsights && (
            <div className="ai-insights-panel">
                <AIInsightsDashboard todos={todos} />
            </div>
        )}
        
        <div className="todo-add">
            <input 
                ref={inputRef} 
                type="text" 
                placeholder='Add Your Task (try: "urgent meeting tomorrow" or "buy groceries")' 
                className='todo-input'
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
            />
            <div onClick={add} className="todo-add-btn">ADD</div>
        </div>
        
        {suggestions.length > 0 && (
            <div className="suggestions-panel">
                <div className="suggestions-header">💡 Smart Suggestions:</div>
                {suggestions.map((suggestion, index) => (
                    <div 
                        key={index} 
                        className="suggestion-item"
                        onClick={() => addSuggestion(suggestion)}
                    >
                        {suggestion}
                    </div>
                ))}
            </div>
        )}
        
        <div className="todo-list">
            {todos.map((item,index)=>{
                return <TodoItems 
                    key={index} 
                    setTodos={setTodos} 
                    no={item.no} 
                    display={item.display} 
                    text={item.text}
                    category={item.category}
                    priority={item.priority}
                    estimatedDuration={item.estimatedDuration}
                    dueDate={item.dueDate}
                />
            })}
        </div>
    </div>
  )
}
