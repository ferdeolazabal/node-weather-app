const fs = require('fs');
const axios = require('axios');
require('colors');

class Busquedas{

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){

        return this.historial.map( item => {

            let palabras = item.split(' ');
            palabras = palabras.map( p => p.charAt(0).toUpperCase() + p.substring(1) );
            
            return palabras.join(' ');
        })
    }


    get paramsMapBox(){
        return {
            'access_token':process.env.MAPBOX_TOKEN,
            'limit': 5,
            'language': 'es',
        }
    }

    get paramsOpenWeather(){
        return {
            'appid':process.env.OPEN_WEATHER_KEY,
            'units': 'metric',
            'lang': 'es',
        }
    }
    
    async ciudad( lugar = ''){

        try {

            console.log("\nBuscando ciudad...".yellow, lugar.yellow);
            
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox 
            });

            const resp = await instance.get( instance.defaults.baseURL );
            // console.log(resp.data);
            return resp.data.features.map( item => ({
                id: item.id,
                nombre: item.place_name,
                lat: item.center[1],
                lng: item.center[0]
            }) )
            
        } catch (error) {
            console.log(error);
        }
    };

    async climaLugar ( lat, lon ){

        try {
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            });
            
            const resp = await instance.get( instance.defaults.baseURL )
            
            if(resp.data.cod === 200){
                const { main, weather } = resp.data;
                return {
                    descripcion: weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1),
                    temperatura: Math.round(main.temp),
                    sensacionTermica: Math.round(main.feels_like),
                    minima: Math.round(main.temp_min),
                    maxima: Math.round(main.temp_max),
                    humedad: Math.round(main.humidity)
                }
            } else {
                return console.log('No se encontró información del clima para la ciudad ingresada'.red);
            }

        } catch (error) {
            console.log(error);
        }

    };

    agregarHistorial( lugar = '' ){
        
        if( this.historial.includes( lugar.toLocaleLowerCase() ) ) return;
        this.historial = this.historial.splice(0,4);
        this.historial.unshift( lugar.toLocaleLowerCase() );
    
        this.guardarDB();
    };

    guardarDB(){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    };

    leerDB(){

        if( !fs.readFileSync( this.dbPath) ) return;

        const info = fs.readFileSync( this.dbPath, 'utf8' );
        const dataJSON = JSON.parse( info );
        
        this.historial = dataJSON.historial;
    
    };



};

module.exports = Busquedas;