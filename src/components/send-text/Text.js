const Text = () => {
    return ( 
        <div className="container">
            <p>Вставьте текст, содержащий сведения о</p>
            <ol>
                <li>Координатах/Месте находки</li>
                <li>Дате находки</li>
                <li>Коллекторе</li>
                <li>Таксономии найденных особей</li>
                <li>Количестве найденных особей</li>
            </ol>
            <textarea placeholder="Введите ваш текст здесь..."></textarea>
        </div>
     );
}
 
export default Text;