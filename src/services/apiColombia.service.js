import axios from 'axios';

const API_URL = 'https://api-colombia.com/api/v1';

const cliente = axios.create({
    baseURL: API_URL,
    timeout: 25000
});

export async function obtenerDepartamentos() {
    const respuesta = await cliente.get('/Department');
    return respuesta.data;
}

export async function obtenerDepartamentoPorId(id) {
    const respuesta = await cliente.get(`/Department/${id}`);
    return respuesta.data;
}

export async function obtenerAtracciones() {
    const respuesta = await cliente.get('/TouristicAttraction');
    return respuesta.data;
}

export async function obtenerCiudades() {
    const respuesta = await cliente.get('/City');
    return respuesta.data;
}