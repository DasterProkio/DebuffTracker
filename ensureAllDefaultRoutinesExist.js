function ensureAllDefaultRoutinesExist(appData, defaultRoutines, defaultDebuffCategories, forceIfListEmpty = false) {
    if (!appData.routine_configs || !Array.isArray(appData.routine_configs)) {
        appData.routine_configs = JSON.parse(JSON.stringify(defaultRoutines));
        return;
    }
    if (forceIfListEmpty && appData.routine_configs.length === 0) {
        appData.routine_configs = JSON.parse(JSON.stringify(defaultRoutines));
        return;
    }
    const existingNames = new Set(appData.routine_configs.map(r => r.name));
    defaultRoutines.forEach(defaultRoutine => {
        if (!existingNames.has(defaultRoutine.name)) {
            appData.routine_configs.push(JSON.parse(JSON.stringify(defaultRoutine)));
        }
    });
    if (!appData.customDebuffCategories || typeof appData.customDebuffCategories !== 'object') {
        appData.customDebuffCategories = JSON.parse(JSON.stringify(defaultDebuffCategories));
    } else if (Object.keys(appData.customDebuffCategories).length === 0) {
        appData.customDebuffCategories = JSON.parse(JSON.stringify(defaultDebuffCategories));
    }
}

module.exports = ensureAllDefaultRoutinesExist;
