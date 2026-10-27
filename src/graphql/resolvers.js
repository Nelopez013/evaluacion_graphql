import {
    obtenerDepartamentos,
    obtenerDepartamentoPorId,
    obtenerAtracciones,
    obtenerCiudades
} from '../services/apiColombia.service.js';

function normalizarTexto(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function transformarDepartamento(departamento) {
    return {
        id: String(departamento.id),
        nombre: departamento.name,
        descripcion: departamento.description ?? null,
        poblacion: departamento.population ?? null,
        superficie: departamento.surface ?? null,
        municipios: departamento.municipalities ?? null,
        prefijoTelefonico: departamento.phonePrefix ?? null,
        capital: departamento.cityCapital?.name ?? null
    };
}

function transformarCiudad(ciudad) {
    return {
        id: String(ciudad.id),
        nombre: ciudad.name,
        descripcion: ciudad.description ?? null,
        poblacion: ciudad.population ?? null,
        codigoPostal: ciudad.postalCode ?? null,
        departamentoId: ciudad.departmentId ?? null
    };
}

function transformarAtraccion(atraccion, ciudades) {
    const ciudad = ciudades.find(
        item => Number(item.id) === Number(atraccion.cityId)
    );

    return {
        id: String(atraccion.id),
        nombre: atraccion.name,
        descripcion: atraccion.description ?? null,
        imagenes: Array.isArray(atraccion.images)
            ? atraccion.images
            : [],
        latitud: atraccion.latitude ?? null,
        longitud: atraccion.longitude ?? null,
        ciudadId: atraccion.cityId ?? null,
        ciudad: atraccion.city?.name ?? ciudad?.name ?? null,
        departamento:
            atraccion.city?.department?.name ??
            ciudad?.department?.name ??
            null
    };
}

export const resolvers = {
    Query: {
        departamentos: async () => {
            const departamentos = await obtenerDepartamentos();

            return departamentos.map(transformarDepartamento);
        },

        departamentoPorId: async (_, { id }) => {
            const departamento = await obtenerDepartamentoPorId(id);

            if (!departamento) {
                return null;
            }

            return transformarDepartamento(departamento);
        },

        departamentosPorPoblacion: async (
            _,
            { minimo, maximo }
        ) => {
            if (minimo != null &&
                maximo != null &&
                minimo > maximo) {
                throw new Error(
                    'La población mínima no puede superar la máxima.'
                );
            }

            const departamentos = await obtenerDepartamentos();

            return departamentos
                .filter(departamento => {
                    const poblacion = departamento.population;

                    if (typeof poblacion !== 'number') {
                        return false;
                    }

                    if (minimo != null && poblacion < minimo) {
                        return false;
                    }

                    if (maximo != null && poblacion > maximo) {
                        return false;
                    }

                    return true;
                })
                .map(transformarDepartamento);
        },

        departamentosOrdenadosPorPoblacion: async (
            _,
            { descendente = true }
        ) => {
            const departamentos = await obtenerDepartamentos();

            return [...departamentos]
                .sort((a, b) =>
                    descendente
                        ? (b.population ?? 0) - (a.population ?? 0)
                        : (a.population ?? 0) - (b.population ?? 0)
                )
                .map(transformarDepartamento);
        },

        ciudades: async () => {
            const ciudades = await obtenerCiudades();

            return ciudades.map(transformarCiudad);
        },

        atracciones: async () => {
            const [atracciones, ciudades] = await Promise.all([
                obtenerAtracciones(),
                obtenerCiudades()
            ]);

            return atracciones.map(atraccion =>
                transformarAtraccion(atraccion, ciudades)
            );
        },

        atraccionesPorCiudad: async (_, { ciudad }) => {
            const [atracciones, ciudades] = await Promise.all([
                obtenerAtracciones(),
                obtenerCiudades()
            ]);

            const ciudadBuscada = normalizarTexto(ciudad);

            const ciudadesEncontradas = ciudades.filter(item =>
                normalizarTexto(item.name) === ciudadBuscada
            );

            const idsCiudades = new Set(
                ciudadesEncontradas.map(item => Number(item.id))
            );

            return atracciones
                .filter(atraccion => {
                    const nombreCiudad =
                        atraccion.city?.name ??
                        ciudades.find(
                            item =>
                                Number(item.id) ===
                                Number(atraccion.cityId)
                        )?.name;

                    return (
                        normalizarTexto(nombreCiudad) === ciudadBuscada ||
                        idsCiudades.has(Number(atraccion.cityId))
                    );
                })
                .map(atraccion =>
                    transformarAtraccion(atraccion, ciudades)
                );
        },

        atraccionesPorDepartamento: async (
            _,
            { departamento }
        ) => {
            const [atracciones, ciudades, departamentos] =
                await Promise.all([
                    obtenerAtracciones(),
                    obtenerCiudades(),
                    obtenerDepartamentos()
                ]);

            const nombreBuscado = normalizarTexto(departamento);

            const departamentosEncontrados = departamentos.filter(item =>
                normalizarTexto(item.name) === nombreBuscado
            );

            const idsDepartamentos = new Set(
                departamentosEncontrados.map(item => Number(item.id))
            );

            const ciudadesDelDepartamento = ciudades.filter(ciudad => {
                const departamentoId =
                    ciudad.departmentId ??
                    ciudad.department?.id;

                return idsDepartamentos.has(Number(departamentoId));
            });

            const idsCiudades = new Set(
                ciudadesDelDepartamento.map(ciudad => Number(ciudad.id))
            );

            return atracciones
                .filter(atraccion => {
                    const ciudad = ciudades.find(
                        item =>
                            Number(item.id) === Number(atraccion.cityId)
                    );

                    const nombreDepartamento =
                        atraccion.city?.department?.name ??
                        ciudad?.department?.name;

                    return (
                        idsCiudades.has(Number(atraccion.cityId)) ||
                        normalizarTexto(nombreDepartamento) === nombreBuscado
                    );
                })
                .map(atraccion =>
                    transformarAtraccion(atraccion, ciudades)
                );
        },

        buscarAtracciones: async (_, { nombre }) => {
            const [atracciones, ciudades] = await Promise.all([
                obtenerAtracciones(),
                obtenerCiudades()
            ]);

            const termino = normalizarTexto(nombre);

            return atracciones
                .filter(atraccion =>
                    normalizarTexto(atraccion.name).includes(termino)
                )
                .map(atraccion =>
                    transformarAtraccion(atraccion, ciudades)
                );
        }
    }
};