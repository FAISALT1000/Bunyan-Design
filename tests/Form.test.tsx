import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ChipsGroup,
  DateRangePicker,
  DesignSystemLocalizationProvider,
  Form,
  RadioGroup,
  ThemeProvider,
  resolveText,
  validateDateRange,
  type DateRange,
  Yup,
  defaultValidationMessages,
  setValidationMessages,
} from '../src';
import { renderWithTheme } from './test-utils';


const dictionary: Record<string, string> = {
  'common.from': 'من',
  'common.to': 'إلى',
  'common.apply': 'تطبيق',
  'tx.all': 'الكل',
  'tx.in': 'وارد',
  'tx.out': 'صادر',
  'errors.required': 'هذا الحقل مطلوب',
};
const nest = (flat: Record<string, string>) => {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let node = out;
    parts.slice(0, -1).forEach(part => { node = node[part] ??= {}; });
    node[parts[parts.length - 1]!] = value;
  }
  return out;
};

/** Theme + i18n-js localization (Arabic) like an app would set it up. */
const Localized = ({ children, extra = {} }: { children: React.ReactNode; extra?: Record<string, string> }) => (
  <ThemeProvider>
    <DesignSystemLocalizationProvider<"en" | "ar"> locale="ar" rtlLocales={[]} translations={{ en: {}, ar: nest({ ...dictionary, ...extra }) }}>
      {children}
    </DesignSystemLocalizationProvider>
  </ThemeProvider>
);

describe('translation', () => {
  it('resolves plain text, keys, params and fallbacks', () => {
    expect(resolveText('Hi')).toBe('Hi');
    expect(resolveText({ localeKey: 'common.from' }, key => dictionary[key] ?? key)).toBe('من');
    expect(resolveText({ localeKey: 'missing.key', fallback: 'Fallback' }, key => dictionary[key] ?? key)).toBe('Fallback');
    expect(resolveText({ localeKey: 'x', params: { n: 2 } }, (k, p) => `${k}:${String(p?.n)}`)).toBe('x:2');
  });
});

describe('ChipsGroup / RadioGroup', () => {
  it('selects a single chip and ignores re-selecting it', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ChipsGroup value="0" onChange={onChange} data={[{ text: 'All', value: '0' }, { text: 'In', value: '1', leftIcon: 'arrow-down-left' }]} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'All' }));
    fireEvent.press(screen.getByRole('button', { name: 'In' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('toggles multiple chips and respects max', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ChipsGroup multiple max={2} value={['a', 'b']} onChange={onChange} data={[{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }, { text: 'C', value: 'c' }]} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'C' })); // over max → ignored
    fireEvent.press(screen.getByRole('button', { name: 'A' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('renders a radiogroup with translated labels', () => {
    const onChange = jest.fn();
    render(
      <Localized>
        <RadioGroup accessibilityLabel="Direction" value="0" onChange={onChange} options={[{ label: { localeKey: 'tx.all' }, value: '0' }, { label: { localeKey: 'tx.in' }, value: '1' }]} />
      </Localized>,
    );
    fireEvent.press(screen.getByRole('radio', { name: 'وارد' }));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});

describe('DateRangePicker', () => {
  it('validates ranges', () => {
    const from = new Date(2026, 9, 10);
    const to = new Date(2026, 9, 1);
    expect(validateDateRange({}, true, false)).toBe('Select a start date');
    expect(validateDateRange({ from }, true, true)).toBe('Select an end date');
    expect(validateDateRange({ from, to })).toBe('The start date must be before the end date');
    expect(validateDateRange({ from: to, to: from }, true, true)).toBeUndefined();
  });

  it('switches the display calendar to Hijri', () => {
    const onCalendarChange = jest.fn();
    renderWithTheme(
      <DateRangePicker value={{ from: new Date(2026, 9, 3) }} onChange={jest.fn()} showHijriToggle onCalendarChange={onCalendarChange} />,
    );
    expect(screen.getByDisplayValue(/2026/)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Hijri' }));
    expect(onCalendarChange).toHaveBeenCalledWith('islamic-umalqura');
    expect(screen.getByDisplayValue(/1448/)).toBeTruthy();
  });
});

describe('Form', () => {
  const fields = (rajhi: boolean) => [
    rajhi && {
      type: 'ChipsGroup' as const,
      name: 'transactionInOrOut' as const,
      label: 'Direction',
      data: [
        { text: { localeKey: 'tx.all' }, value: '0' },
        { text: { localeKey: 'tx.in' }, value: '1', leftIcon: 'arrow-down-left' as const },
        { text: { localeKey: 'tx.out' }, value: '2', leftIcon: 'arrow-up-right' as const },
      ],
    },
    {
      type: 'DateRangePicker' as const,
      name: 'transactionDate' as const,
      fromLabel: { localeKey: 'common.from' },
      toLabel: { localeKey: 'common.to' },
      maximumDate: new Date(2030, 0, 1),
      showHijriToggle: true,
    },
  ];

  it('renders the fields array (skipping falsy entries) with translations', () => {
    render(
      <Localized>
        <Form initialValues={{ transactionInOrOut: '0', transactionDate: {} as DateRange }} onSubmit={jest.fn()} fields={fields(false)} submitButton={{ text: { localeKey: 'common.apply' } }} />
      </Localized>,
    );
    expect(screen.queryByRole('button', { name: 'الكل' })).toBeNull();
    expect(screen.getByText('من')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'تطبيق' })).toBeTruthy();
  });

  it('validates with Yup on submit, shows translated errors, then submits values', async () => {
    const onSubmit = jest.fn();
    render(
      <Localized>
        <Form
          initialValues={{ transactionInOrOut: '0', transactionDate: {} as DateRange }}
          validationSchema={Yup.object({ transactionDate: Yup.mixed().dateRange(true, false, { fromRequired: 'errors.required' }) })}
          onSubmit={onSubmit}
          fields={fields(true)}
        />
      </Localized>,
    );
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(await screen.findByText('هذا الحقل مطلوب')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'صادر' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'صادر' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: true })));
  });

  it('submits current values', async () => {
    const onSubmit = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ email: '', agree: false }}
        validationSchema={Yup.object({ email: Yup.string().email('Enter a valid email').required('Required') })}
        onSubmit={onSubmit}
        fields={[
          { type: 'Input', name: 'email', label: 'Email', required: true, keyboardType: 'email-address' },
          { type: 'Checkbox', name: 'agree', label: 'I agree' },
        ]}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Email'), 'faisal@bunyan.sa');
    fireEvent.press(screen.getByRole('checkbox', { name: 'I agree' }));
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'faisal@bunyan.sa', agree: true });
  });

  it('supports visibleWhen, custom field types and a reset button', async () => {
    function Stars({ value, setValue }: { value: unknown; setValue: (v: unknown) => void }) {
      return <>{[1, 2, 3].map(n => <ChipsGroup key={n} value={String(value)} onChange={() => setValue(n)} data={[{ text: `★${n}`, value: String(n) }]} />)}</>;
    }
    renderWithTheme(
      <Form
        initialValues={{ kind: 'basic', rating: 1 }}
        onSubmit={jest.fn()}
        resetButton={{ text: 'Reset' }}
        fieldTypes={{ Stars }}
        fields={[
          { type: 'RadioGroup', name: 'kind', options: [{ label: 'Basic', value: 'basic' }, { label: 'Rated', value: 'rated' }] },
          // custom local type (not in FormFieldTypes) — cast for the test
          { type: 'Stars', name: 'rating', visibleWhen: (values: { kind: string }) => values.kind === 'rated' } as never,
        ]}
      />,
    );
    expect(screen.queryByText('★2')).toBeNull();
    fireEvent.press(screen.getByRole('radio', { name: 'Rated' }));
    expect(await screen.findByText('★2')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(screen.queryByText('★2')).toBeNull());
  });
});


describe('Form shows Bunyan rule messages', () => {
  afterEach(() => setValidationMessages(defaultValidationMessages));

  it('translates locale-key messages with their params', async () => {
    setValidationMessages({ minMax: { localeKey: 'errors.length' } });
    render(
      <Localized extra={{ 'errors.length': 'يجب أن يكون بين %{min} و %{max} حروف' }}>
        <Form
          initialValues={{ name: 'a' }}
          onSubmit={jest.fn()}
          validationSchema={Yup.object({ name: Yup.string().minMax(2, 4) })}
          fields={[{ type: 'Input', name: 'name', label: 'Name' }]}
        />
      </Localized>,
    );
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(await screen.findByText('يجب أن يكون بين 2 و 4 حروف')).toBeTruthy();
  });
});

describe('Form InputField type', () => {
  it('renders a floating-label InputField with its own label and error', async () => {
    const onSubmit = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ email: '' }}
        onSubmit={onSubmit}
        validationSchema={Yup.object({ email: Yup.string().required('Email is required') })}
        fields={[{ type: 'InputField', name: 'email', label: 'Email', inputType: 'email', required: true }]}
      />,
    );
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(await screen.findByText('Email is required')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText(/Email/), 'a@b.co');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co' }, expect.anything()));
  });
});
