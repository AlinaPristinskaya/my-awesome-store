'use server';

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

// 1. Поиск городов
export async function getNPCities(search: string) {
  if (!search || search.length < 2) return [];

  try {
    const response = await fetch(NP_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: process.env.NOVAPOSHTA_API_KEY,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: {
          FindByString: search,
          Limit: "20"
        }
      }),
    });

    const data = await response.json();
    // Возвращаем массив с Названием и Ref (уникальный ID города в системе НП)
    return data.success ? data.data.map((city: any) => ({
      label: city.Description,
      value: city.Ref
    })) : [];
  } catch (error) {
    console.error("NP Cities Error:", error);
    return [];
  }
}

// 2. Поиск отделений с учетом веса
export async function getNPWarehouses(cityRef: string, weight: number) {
  if (!cityRef) return [];

  try {
    const response = await fetch(NP_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: process.env.NOVAPOSHTA_API_KEY,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
        }
      }),
    });

    const data = await response.json();
    if (!data.success) return [];

    // ФИЛЬТРАЦИЯ ПО ВЕСУ:
    // Мы оставляем отделения, где TotalMaxWeightAllowed >= нашему весу
    // Или где TotalMaxWeightAllowed === "0" (что у НП значит "без ограничений" / грузовое)
    return data.data
      .filter((wh: any) => {
        const limit = parseFloat(wh.TotalMaxWeightAllowed);
        return limit === 0 || limit >= weight;
      })
      .map((wh: any) => ({
        label: wh.Description,
        value: wh.Ref,
        type: wh.TypeOfWarehouse // Чтобы понимать, почтомат это или нет
      }));
  } catch (error) {
    console.error("NP Warehouses Error:", error);
    return [];
  }
}