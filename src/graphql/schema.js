export const typeDefs = `#graphql

    type Departamento {
        id: ID!
        nombre: String!
        descripcion: String
        poblacion: Int
        superficie: Float
        municipios: Int
        prefijoTelefonico: String
        capital: String
    }

    type Ciudad {
        id: ID!
        nombre: String!
        descripcion: String
        poblacion: Int
        codigoPostal: String
        departamentoId: Int
    }

    type AtraccionTuristica {
        id: ID!
        nombre: String!
        descripcion: String
        imagenes: [String!]!
        latitud: String
        longitud: String
        ciudadId: Int
        ciudad: String
        departamento: String
    }

    type Query {
        departamentos: [Departamento!]!

        departamentoPorId(id: ID!): Departamento

        departamentosPorPoblacion(
            minimo: Int
            maximo: Int
        ): [Departamento!]!

        departamentosOrdenadosPorPoblacion(
            descendente: Boolean = true
        ): [Departamento!]!

        ciudades: [Ciudad!]!

        atracciones: [AtraccionTuristica!]!

        atraccionesPorCiudad(
            ciudad: String!
        ): [AtraccionTuristica!]!

        atraccionesPorDepartamento(
            departamento: String!
        ): [AtraccionTuristica!]!

        buscarAtracciones(
            nombre: String!
        ): [AtraccionTuristica!]!
    }
`;