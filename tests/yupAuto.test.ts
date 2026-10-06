import { Yup, dateRangeSchema, validateDateRange } from '../src';

describe('Yup shipped by Bunyan', () => {
  it('exports Yup with mixed().dateRange() ready to use', async () => {
    const schema = Yup.object({ period: Yup.mixed().dateRange(true, true) });
    await expect(schema.validate({ period: {} })).rejects.toThrow('Select a start date');
    await expect(schema.validate({ period: { from: new Date(2026, 0, 1), to: new Date(2026, 0, 2) } })).resolves.toBeTruthy();
  });

  it('is the full Yup API, types included', async () => {
    const schema = Yup.object({ email: Yup.string().email().required() });
    const value: Yup.InferType<typeof schema> = { email: 'a@b.sa' };
    await expect(schema.validate(value)).resolves.toEqual(value);
  });

  it('dateRangeSchema() works without the method', async () => {
    const schema = dateRangeSchema(false, true, { toRequired: 'errors.to' });
    await expect(schema.validate({ from: new Date() })).rejects.toThrow('errors.to');
    expect(validateDateRange({ from: new Date(2026, 1, 2), to: new Date(2026, 1, 1) })).toMatch(/before/);
  });
});
