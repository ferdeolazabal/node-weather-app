require('dotenv').config()
require('colors');
const { leerInput,
        inquireMenu,
        pausa,
        listarLugares} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");



const main = async () => {

    let menu = null
    const busquedas = new Busquedas()
    do{
        menu = await inquireMenu()

        switch(menu){
            case 1:
                const search = await leerInput('Ingrese el nombre de la ciudad a buscar: ');
                const lugares = await busquedas.ciudad( search );
                const id = await listarLugares( lugares );
                if( id === '0' ) continue;
                const lugarSel = lugares.find( i => i.id === id);
                busquedas.agregarHistorial( lugarSel.nombre );
                
                //Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );
                console.clear();
                console.log(`\nInformacion del lugar seleccionado:\n`.green);
                console.log(`Lugar: ${lugarSel.nombre}`.green);
                console.log(`Latitud: ${lugarSel.lat}`);
                console.log(`Longitud: ${lugarSel.lng}`);
                console.log(`Clima: ${clima?.descripcion.green}`);
                console.log(`Temperatura: ${clima?.temperatura}°C`);
                console.log(`Sensación térmica: ${clima?.sensacionTermica}°C`);
                console.log(`Mínima: ${clima?.minima}°C`);
                console.log(`Máxima: ${clima?.maxima}°C`);
                console.log(`Humedad: ${clima?.humedad}%`);
                console.log(`\n`);

                break
            case 2:
                console.log('\n');
                busquedas.historialCapitalizado.forEach( (lugar, index) => {
                    const idx = `${index + 1} - `.green
                    console.log(`${idx}${lugar}`);
                });

                break
            case 0:
                console.log('Saliendo...\n'.red)
                break

        };

        if( menu !== 0 )await pausa();

    }while(menu != 0)


};

main();