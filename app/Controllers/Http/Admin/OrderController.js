'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Order = use('App/Models/Order')
const Database = use('Database')
const Service = use('App/Services/Order/OrderServices')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, pagination }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.where('id', 'LIKE', `%${id}%`)
    }

    const orders = query.paginate(pagination.pages, pagination.limit)
    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction()

    try {
      const { userId, items, status } = request.all()
      let order = await Order.create({ userId, status }, trx)

      const service = new Service(order, trx)

      if (items && items.length > 0) {
        await service.syncItems(items)
      }

      await trx.commit()

      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível criar o pedido.',
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {
    const order = await Order.findOrFail(id)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      const { userId, items, status } = request.all()

      order.merge({ user_id, status })
      const service = new Service(order, trx)

      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()

      return response.send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar o pedido.',
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()

      return response.status(204).send()
    } catch (error) {
      await trx.rollback()

      return response.status(400).send({
        message: 'Não foi possível deletar o pedido.',
      })
    }
  }
}

module.exports = OrderController
