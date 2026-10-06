import { validateDateRange } from '../src';

describe('Yup helpers without setup', () => {
  it('registers Yup.mixed().dateRange() automatically when Bunyan is imported', async () => {
    let Yup: typeof import('yup') | undefined;
    jest.isolateModules(() => {
      require('../src'); // importing the design system is enough
      Yup = require('yup');
    });
    const schema = Yup!.object({ period: Yup!.mixed().dateRange(true, true) });
    await expect(schema.validate({ period: {} })).rejects.toThrow('Select a start date');
    await expect(schema.validate({ period: { from: new Date(2026, 0, 1), to: new Date(2026, 0, 2) } })).resolves.toBeTruthy();
  });

  it('dateRangeSchema() works without touching Yup', async () => {
    let schemaFactory: typeof import('../src').dateRangeSchema | undefined;
    jest.isolateModules(() => {
      schemaFactory = require('../src').dateRangeSchema;
    });
    const schema = schemaFactory!(false, true, { toRequired: 'errors.to' });
    await expect(schema.validate({ from: new Date() })).rejects.toThrow('errors.to');
    expect(validateDateRange({ from: new Date(2026, 1, 2), to: new Date(2026, 1, 1) })).toMatch(/before/);
  });
});
