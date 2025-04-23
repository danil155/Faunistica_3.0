import { useFormContext } from "../pages/FormContext";
import { useState, useEffect } from "react";


const DateSelect = () => {
    const {formState, setFormState} = useFormContext()

    const [isInterval, setIsInterval] = useState(false)
    const [precision, setPrecision] = useState('exact')
    const [beginMonth, setBeginMonth] = useState('')
    const [endMonth, setEndMonth] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "begin_month") {
            setBeginMonth(value)
            let nums = value.split("-")
            formState.begin_year = Number(nums[0])
            formState.begin_month = Number(nums[1])
        } else if (name === "end_month") {
            setEndMonth(value)
            let nums = value.split("-")
            formState.end_year = Number(nums[0])
            formState.end_month = Number(nums[1])
        } else {
        setFormState(prev => ({...prev, [name]: value}))
        }
    };

    useEffect(() => {
        if (formState.begin_month === 0) {
            setBeginMonth('')
        };

    },[formState.begin_month]);

    useEffect(() => {
        if (formState.end_month === 0) {
            setEndMonth('');

        }
    }, [formState.end_month])

    return ( 
        <>
        <div className="form-row">
        <div className="form-group">
          <label>Тип даты:</label>
          <select 
            value={isInterval} 
            onChange={(e) => setIsInterval(e.target.value)}
            className="form-control"
          >
            <option value={false}>Одиночная дата</option>
            <option value={true}>Интервал дат</option>
          </select>
        </div>

        <div className="form-group">
          <label>Точность:</label>
          <select 
            value={precision} 
            onChange={(e) => setPrecision(e.target.value)}
            className="form-control"
          >
            <option value="exact">Точная дата</option>
            <option value="month">С точностью до месяца</option>
            <option value="year">С точностью до года</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          {precision === 'exact' && (
            <>
              <label>Дата:</label>
              <input
                type="date"
                name="begin_date"
                value={formState.begin_date}
                onChange={handleChange}
                className="form-control"
                required
              />
            </>
          )}
          
          {precision === 'month' && (
            <>
              <label>Месяц и год:</label>
              <input
                type="month"
                name="begin_month"
                value={beginMonth}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          {(precision === 'year') && (
            <>
              <label>Год:</label>
              <input
                type="number"
                name="begin_year"
                min="1900"
                max="2100"
                value={formState.begin_year}
                onChange={handleChange}
                required
              />
            </>
          )}
        </div>

      {isInterval && (
        <div className="form-group">
          {precision === 'exact' && (
            <>
              <label>Конечная дата:</label>
              <input
                type="date"
                name="end_Date"
                value={formState.end_date}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          {precision === 'month' && (
            <>
              <label>Конечный месяц и год:</label>
              <input
                type="month"
                name="end_month"
                value={endMonth}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          {precision === 'year' && (
            <>
              <label>Конечный год:</label>
              <input
                type="number"
                name="end_year"
                min="1800"
                max="2100"
                value={formState.end_year}
                onChange={handleChange}
                required
              />
            </>
          )}
        </div>
      )}
      </div>
      </>
     );
}
 
export default DateSelect;