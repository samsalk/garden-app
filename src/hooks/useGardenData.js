import { useState, useEffect } from "react";
import { loadAndMigrate } from "@/utils/migrate";
import { buildSpanCells, clearSpanCells, resolvePrimary } from "@/utils/grid";
import { today } from "@/utils/date";

export function useGardenData() {
  const [data, setData] = useState(loadAndMigrate);

  useEffect(() => {
    localStorage.setItem("gp-v5", JSON.stringify(data));
  }, [data]);

  const addGarden = (g) => {
    setData(d => ({ ...d, gardens: [...d.gardens, g] }));
  };

  const deleteGarden = (id) => {
    setData(d => ({ ...d, gardens: d.gardens.filter(g => g.id !== id) }));
  };

  const addZone = (gId, zone) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : { ...g, zones: [...g.zones, zone] })
    }));
  };

  const deleteZone = (gId, zId) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : { ...g, zones: g.zones.filter(z => z.id !== zId) })
    }));
  };

  const setCellsForZone = (gId, zId, newCells) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : {
        ...g,
        zones: g.zones.map(z => z.id !== zId ? z : { ...z, cells: newCells })
      })
    }));
  };

  const updateCell = (gId, zId, key, cellData, sw = 1, sh = 1) => {
    setData(d => {
      const g = d.gardens.find(x => x.id === gId);
      const z = g?.zones.find(x => x.id === zId);
      if (!z) return d;
      const cells = clearSpanCells(z.cells || {}, key);
      const spanCells = buildSpanCells(...key.split(",").map(Number), sw, sh, cellData);
      return {
        ...d,
        gardens: d.gardens.map(g => g.id !== gId ? g : {
          ...g,
          zones: g.zones.map(z => z.id !== zId ? z : { ...z, cells: { ...cells, ...spanCells } })
        })
      };
    });
  };

  const clearCellByKey = (gId, zId, key) => {
    setData(d => {
      const g = d.gardens.find(x => x.id === gId);
      const z = g?.zones.find(x => x.id === zId);
      if (!z) return d;
      return {
        ...d,
        gardens: d.gardens.map(g => g.id !== gId ? g : {
          ...g,
          zones: g.zones.map(z => z.id !== zId ? z : { ...z, cells: clearSpanCells(z.cells || {}, key) })
        })
      };
    });
  };

  const addCustomPlant = (p) => {
    setData(d => ({ ...d, customPlants: [...(d.customPlants || []), p] }));
  };

  const updateSettings = (s) => {
    setData(d => ({ ...d, settings: { ...(d.settings || {}), ...s } }));
  };

  const updateWeatherCache = (cache) => {
    setData(d => ({ ...d, settings: { ...(d.settings || {}), weatherCache: cache } }));
  };

  const paintCell = (gId, zId, key, plantId) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : {
        ...g,
        zones: g.zones.map(z => {
          if (z.id !== zId) return z;
          const cells = z.cells || {};
          const existing = cells[key];
          if (existing?.plantId || existing?.occupiedBy) return z;
          return { ...z, cells: { ...cells, [key]: { plantId, status: "planned", spanW: 1, spanH: 1, createdAt: new Date().toISOString(), careSchedule: {}, careLogs: {}, nextUp: null } } };
        })
      })
    }));
  };

  const logCellCare = (gId, zId, cellKey, careType) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : {
        ...g,
        zones: g.zones.map(z => z.id !== zId ? z : {
          ...z,
          cells: {
            ...z.cells,
            [cellKey]: {
              ...z.cells[cellKey],
              careLogs: {
                ...(z.cells[cellKey]?.careLogs || {}),
                [careType]: [...(z.cells[cellKey]?.careLogs?.[careType] || []), { date: today() }]
              }
            }
          }
        })
      })
    }));
  };

  const logZoneWatering = (gId, zId) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : {
        ...g,
        zones: g.zones.map(z => z.id !== zId ? z : {
          ...z,
          wateringLog: [...(z.wateringLog || []), { date: today() }]
        })
      })
    }));
  };

  const updateZone = (gId, zId, updates) => {
    setData(d => {
      const g = d.gardens.find(x => x.id === gId);
      const z = g?.zones.find(x => x.id === zId);
      if (!z) return d;

      const newW = updates.w !== undefined ? updates.w : z.w;
      const newH = updates.h !== undefined ? updates.h : z.h;

      // Prune cells that fall outside a shrunken boundary
      let newCells = { ...(z.cells || {}) };
      if (newW < z.w || newH < z.h) {
        const gone = new Set(
          Object.keys(newCells).filter(k => {
            const [r, c] = k.split(",").map(Number);
            return r >= newH || c >= newW;
          })
        );
        // Also evict occupied-by cells whose primary was pruned
        for (const [k, cell] of Object.entries(newCells)) {
          if (cell.occupiedBy && gone.has(cell.occupiedBy)) gone.add(k);
        }
        for (const k of gone) delete newCells[k];
      }

      return {
        ...d,
        gardens: d.gardens.map(g => g.id !== gId ? g : {
          ...g,
          zones: g.zones.map(z => z.id !== zId ? z : { ...z, ...updates, cells: newCells })
        })
      };
    });
  };

  const updateZoneWateringFreq = (gId, zId, days) => {
    setData(d => ({
      ...d,
      gardens: d.gardens.map(g => g.id !== gId ? g : {
        ...g,
        zones: g.zones.map(z => z.id !== zId ? z : { ...z, wateringFreqDays: days })
      })
    }));
  };

  return {
    data,
    addGarden,
    deleteGarden,
    addZone,
    deleteZone,
    updateZone,
    updateCell,
    clearCellByKey,
    addCustomPlant,
    paintCell,
    logCellCare,
    logZoneWatering,
    updateZoneWateringFreq,
    updateSettings,
    updateWeatherCache,
  };
}
