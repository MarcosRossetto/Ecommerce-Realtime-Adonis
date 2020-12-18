'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Role = use('Role')

class RoleSeeder {
  async run() {
    await Role.create({
      name: 'Admin',
      slug: 'admin',
      description: 'Administrador do sistema.',
    })

    await Role.create({
      name: 'Manager',
      slug: 'manager',
      description: 'Gerente da loja.',
    })

    await Role.create({
      name: 'Client',
      slug: 'client',
      description: 'Cliente da loja',
    })
  }
}

export default RoleSeeder
