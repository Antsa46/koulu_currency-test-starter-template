import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { convertAmount } from '../controllers/currencyController'
import * as currencyService from '../services/currencyService'

vi.mock('../services/currencyService')

const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn()
  return res
}

describe('CurrencyController.convertAmount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('Return conversion with valid request', async () => {
    const req: any = { body: { from: 'EUR', to: 'SEK', amount: 10 } }
    const res = createMockResponse()
    const payload = { amount: 9 }
    vi.mocked(currencyService.convert).mockResolvedValue(payload)

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ amount: 9 })
  })

  test('Return 400 for invalid currency code', async () => {
    const req: any = { body: { from: 'EU', to: 'SEK', amount: 10 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Currency codes must be 3-letter ISO abbreviations (e.g., USD, EUR).'
    })
  })

  test('Return 400 for missing source currency', async () => {
    const req: any = { body: { to: 'SEK', amount: 10 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Body parameters "from" and "to" are required.'
    })
  })

  test('Return 400 for missing target currency', async () => {
    const req: any = { body: { from: 'EUR', amount: 10 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Body parameters "from" and "to" are required.'
    })
  })

  test('Return 400 for invalid target currency code', async () => {
    const req: any = { body: { from: 'EUR', to: 'SE', amount: 10 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Currency codes must be 3-letter ISO abbreviations (e.g., USD, EUR).'
    })
  })

  test('Return 400 for invalid amount', async () => {
    const req: any = { body: { from: 'EUR', to: 'SEK', amount: 'invalid' } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be a valid number.' })
  })

  test('Return 400 for zero amount', async () => {
    const req: any = { body: { from: 'EUR', to: 'SEK', amount: 0 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be greater than zero.' })
  })

  test('Return 400 for negative amount', async () => {
    const req: any = { body: { from: 'EUR', to: 'SEK', amount: -10 } }
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be greater than zero.' })
  })

  test('Return 500 when service throws an error', async () => {
    const req: any = { body: { from: 'EUR', to: 'SEK', amount: 10 } }
    const res = createMockResponse()
    vi.mocked(currencyService.convert).mockRejectedValue(
      new Error('Error retrieving exchange rate.')
    )

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving exchange rate.' })
  })
})
