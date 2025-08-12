const ensureAllDefaultRoutinesExist = require('../ensureAllDefaultRoutinesExist');

describe('ensureAllDefaultRoutinesExist', () => {
  const defaultRoutines = [
    { name: 'Routine A', frequency_hours: 1 },
    { name: 'Routine B', frequency_days: 1 },
  ];
  const defaultDebuffCategories = { cat1: ['sub'] };

  test('adds missing default routines and preserves existing ones', () => {
    const appData = { routine_configs: [{ name: 'Routine A', frequency_hours: 5 }], customDebuffCategories: {} };
    ensureAllDefaultRoutinesExist(appData, defaultRoutines, defaultDebuffCategories);
    expect(appData.routine_configs).toEqual(expect.arrayContaining([
      { name: 'Routine A', frequency_hours: 5 },
      { name: 'Routine B', frequency_days: 1 },
    ]));
  });

  test('does not duplicate routines already present', () => {
    const appData = {
      routine_configs: [
        { name: 'Routine A', frequency_hours: 5 },
        { name: 'Routine B', frequency_days: 1 },
      ],
      customDebuffCategories: {},
    };
    ensureAllDefaultRoutinesExist(appData, defaultRoutines, defaultDebuffCategories);
    expect(appData.routine_configs).toEqual([
      { name: 'Routine A', frequency_hours: 5 },
      { name: 'Routine B', frequency_days: 1 },
    ]);
  });
});
