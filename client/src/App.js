import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {
  const [planets, setPlanets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setisEditing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [img, setImg] = useState('');
  const [position, setPosition] = useState('');
  const [velocity, setVelocity] = useState('');


  useEffect(() => {
    axios.get('/api/planets').then(res => { 
      if (res.data) {
        const planets = Object.keys(res.data).reduce((accum, current) => {
          accum.push(JSON.parse(res.data[current]));
          return accum;
        }, [])
        setPlanets(planets);
      }
    }).catch(err => console.error(err))
  }, []);

  const onEdit = (name) => {
    setIsCreating(false);
    setisEditing(true);
    clearInputs();
    const planet = planets.find(planet => planet.name === name);
    if (planet) {
      const data = planets.map(item => item.name === name ? { ...item, isEditing: true } : { ...item, isEditing: false })
      setName(planet.name || "");
      setDescription(planet.description || "");
      setImg(planet.img || "")
      setPosition(planet.position || "");
      setVelocity(planet.velocity || "")
      setPlanets(data)
    }
  }

  const onPut = () => {
    let planet = { name }
    if (description) planet.description = description;
    if (img) planet.img = img;
    axios.put(`/api/planets/${name}`, planet).then(res => { 
      const data = planets.map(item => item.name === name ? { ...planet, isEditing: false } : item)
      setPlanets(data);
      setisEditing(false);
    }).catch(err => {
      setisEditing(true);
      console.error(err)
    })
  }

  const onRemove = (name) => {
    setisEditing(false);
    setIsCreating(false);
    axios.delete(`/api/planets/${name}`)
      .then(result => {
        console.log('deleted...')
        const filtered = planets.filter((elm, i) => elm.name !== name).map(item => ({ ...item, isEditing: false }));
        setPlanets(filtered);
        clearInputs();
        
      }).catch(err => console.error(err))
  }

  const addNew = () => {
    setIsCreating(true);
    setisEditing(false);
    clearInputs();
    const data = planets.map(item => ({ ...item, isEditing: false }))
    setPlanets(data);
  };

  const submitNew = (e) => {
    let planet = { name }
    if (description) planet.description = description;
    if (img) planet.img = img;
    axios.put(`/api/planets/${name}`, planet)
      .then(result => {
        const data = [...planets, planet];
        clearInputs();
        setPlanets(data);
        setIsCreating(false)
      }).catch(err => console.error(err))
  }

  const onCancelEdit = () => {
    setIsCreating(false);
    setisEditing(false);
    clearInputs();
    const data = planets.map(item => ({ ...item, isEditing: false }));
    setPlanets(data);
  }

  const clearInputs = () => {
    setName("");
    setDescription("");
    setImg("");
    setPosition("");
    setVelocity("");
  }

  return (
    <div className="app">
      {!isCreating && !isEditing && <button className='app__add-new' onClick={(e) => {addNew();}}>Add New</button>}
      {isCreating && !isEditing && (<div className='app__add-new-form'>
        <div className='app__form-group'>
          <label>Name: </label>
          <input className='app__name' value={name} onChange={(e) => setName(e.target.value) } />
        </div>
        <div className='app__form-group'>
         <label>Description: </label>
         <input className='app__description' value={description} onChange={(e) => setDescription(e.target.value) } />
        </div>
        <div className='app__form-group'>
          <label>Image URL: </label>
          <input className='app__img' value={img} onChange={(e) => setImg(e.target.value) } />
        </div>
        <div className='app__form-group'>
          <label>Position: </label>
          <input className='app__img' value={position || ''} onChange={(e) => setPosition(e.target.value) } /> 
        </div>
        <div className='app__form-group'>
          <label>Velocity: </label>
          <input className='app__img' value={velocity || ''} onChange={(e) => setVelocity(e.target.value) } /> 
        </div>
        <div className='app__form-buttons'>
          <button className='app__add-new-cancel' onClick={(e) => { clearInputs(); setIsCreating(false); }}>Cancel</button>
          <button className='app__add-new-submit' disabled={!name} onClick={(e) => submitNew(name)}>Submit</button>
        </div>
      </div>)}
      {planets.length > 0 && (<div className='app__planets'>
        {planets.map((planet) => 
          <>
          {!planet.isEditing && (<div className='app__planet' key={name}>
            {planet.img && <img src={planet.img} alt={planet.name} className='app__planet-img' />}
            <h4>{planet.name}</h4>
            {planet.description && <p>{planet.description}</p>}
            <div className='app__form-buttons'>
              <button className='edit' onClick={(e) => onEdit(planet.name)}>Edit</button>
              <button className='delete' onClick={(e) => onRemove(planet.name)}>Delete</button>
            </div>
          </div>)}
          {planet.isEditing && (<div className='app__edit-form' key={name}>
            <div className='app__form-group'>
              <label>Name: </label>
              <input className='app__name' value={name || ''} disabled onChange={(e) => setName(e.target.value) } />
            </div>
              <div className='app__form-group'>
                <label>Description: </label>
                <input className='app__description' value={description || ''} onChange={(e) => setDescription(e.target.value) } /> 
              </div>
            <div className='app__form-group'>
              <label>Image URL: </label>
              <input className='app__img' value={img || ''} onChange={(e) => setImg(e.target.value) } /> 
            </div>
            <div className='app__form-group'>
              <label>Position: </label>
              <input className='app__img' value={position || ''} onChange={(e) => setPosition(e.target.value) } /> 
            </div>
            <div className='app__form-group'>
              <label>Velocity: </label>
              <input className='app__img' value={velocity || ''} onChange={(e) => setVelocity(e.target.value) } /> 
            </div>
            <div className='app__form-buttons'>
              <button className='app__edit-cancel' onClick={(e) => { clearInputs(); onCancelEdit(); }}>Cancel</button>
              <button className='app__edit-submit' onClick={(e) => onPut()}>Submit Edit</button>
            </div>
          </div>)}
        </>
        )}
      </div>)}
    </div>
  );
}

export default App;
