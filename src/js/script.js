let allItems = {};

// Função para carregar todos os itens do jogo
function loadAllItems(callback) {
    const itemsApiUrl = "https://bitmatemediator.net/game/v1/items";
    fetch(itemsApiUrl)
        .then(response => response.json())
        .then(data => {
            allItems = data;
            console.log("Itens carregados com sucesso.");
            if (callback) callback(); // Executa o callback se definido
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
}

loadAllItems(() => {
    console.log("Funções dependentes de allItems podem ser chamadas.");
});

document.addEventListener("DOMContentLoaded", () => {
    loadAllItems();

    // Chame a função para exibir o inventário vazio inicialmente
    displayInventoryItems([]);

    async function fetchEquipmentItems(playerName) {
        try {
            const response = await fetch(`https://bitmatemediator.net/game/v1/equipment/${playerName}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar equipamentos:", error);
            return [];
        }
    }

    function organizeItems(items) {
        const organized = {
            Weapons: [],
            Earrings: [],
            Rings: [],
            Belts: [],
            Boots: [],
            Necklaces: []
        };

        // Mapeamento de tipos
        const typeMapping = {
            "Earrings": "Earrings",
            "Ring": "Rings",
            "Belt": "Belts",
            "Boots": "Boots",
            "Necklace": "Necklaces"
        };

        items.forEach(item => {
            console.log("Item processado:", item);
            if (item && allItems[item.id]) {
                const itemType = allItems[item.id].type;
                const mappedType = itemType.includes("Weapon") ? "Weapons" : typeMapping[itemType] || null; // Mapeia o tipo

                if (mappedType) {
                    organized[mappedType].push(item);
                } else {
                    console.warn(`Tipo de item desconhecido: ${itemType}`);
                }
            }
        });

        return organized;
    }

    function generateItemsHTML(organizedItems) {
        let html = '';

        Object.entries(organizedItems).forEach(([type, items]) => {
            if (items.length > 0) {
                html += `<div class="section">
                            <h3>${type}</h3>
                            <div class="items-list">`;

                items.forEach(item => {
                    const itemName = allItems[item.id]?.name || "Unknown Item";
                    const itemImage = allItems[item.id]?.image || "";

                    html += `
                        <div class="item">
                            ${itemImage ? `<img src="${itemImage}" alt="${itemName}">` : ''}
                            <span class="amount">${item.amount}</span>
                        </div>`;
                });

                html += `</div></div>`;
            }
        });

        return html;
    }

    async function fetchInventoryItems(playerName) {
        const inventoryApiUrl = `https://bitmatemediator.net/game/v1/inventory/${playerName}`;
        try {
            const response = await fetch(inventoryApiUrl);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar inventário:", error);
            return [];
        }
    }

    function displayInventoryItems(items) {
        const inventoryContentDiv = document.getElementById("inventory-content");
        inventoryContentDiv.innerHTML = ""; // Limpa o conteúdo anterior
        inventoryContentDiv.style.display = "grid"; // Usar grid para o layout
    
        // Se não houver itens, cria 36 slots vazios
        const totalSlots = 36; // Total de slots que você deseja exibir
        const itemCount = items.length;
    
        for (let i = 0; i < totalSlots; i++) {
            const listItem = document.createElement("div");
            listItem.className = "inventory-item"; // Adiciona a classe para o estilo
    
            if (i < itemCount && items[i]) {
                const itemName = allItems[items[i].id]?.name || "Unknown Item";
                const itemImage = allItems[items[i].id]?.image || "";
                const itemAmount = items[i].amount;
    
                if (itemImage) {
                    const img = document.createElement("img");
                    img.src = itemImage;
                    img.alt = itemName;
                    listItem.appendChild(img);
                }
    
                const amountText = document.createElement("span");
                amountText.className = "amount"; // Adiciona a classe para o texto
                amountText.textContent = itemAmount;
                listItem.appendChild(amountText);
            } else {
                // Se não houver item, apenas exibe um slot vazio
                listItem.textContent = ""; // Ou você pode adicionar um ícone ou texto para indicar que está vazio
            }
    
            inventoryContentDiv.appendChild(listItem);
        }
    }

    window.performSearch = async function () {
        const searchValue = document.getElementById('searchValue').value.trim();

        if (!searchValue) {
            return;
        }

        try {
            let playerName = searchValue;

            // Verifica se é um endereço de wallet
            if (/^0x[a-fA-F0-9]{40}$/.test(searchValue)) {
                const response = await fetch(`https://bitmatemediator.net/highscore/v1/player/${searchValue}`);
                const data = await response.json();
                if (!data.data?.name) {
                    return;
                }
                playerName = data.data.name;
            }

            // Busca equipamentos
            const equipment = await fetchEquipmentItems(playerName);
            const organizedEquipment = organizeItems(equipment);
            updateEquipmentDisplay(organizedEquipment);

            // Busca inventário
            const inventory = await fetchInventoryItems(playerName);
            displayInventoryItems(inventory);
        } catch (error) {
            console.error("Erro na busca:", error);
        }
    };

    // Suporte para tecla Enter no campo de busca
    document.getElementById('searchValue').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function updateEquipmentDisplay(organizedEquipment) {
        // Atualiza o primeiro conjunto de equipamentos
        document.getElementById('earring1').innerHTML = organizedEquipment.Earrings[0] ?
            `<img src="${allItems[organizedEquipment.Earrings[0].id].image}" alt="${allItems[organizedEquipment.Earrings[0].id].name}">` : '';
        
        document.getElementById('ring1').innerHTML = organizedEquipment.Rings[0] ?
            `<img src="${allItems[organizedEquipment.Rings[0].id].image}" alt="${allItems[organizedEquipment.Rings[0].id].name}">` : '';
        
        document.getElementById('weapon1').innerHTML = organizedEquipment.Weapons[0] ?
            `<img src="${allItems[organizedEquipment.Weapons[0].id].image}" alt="${allItems[organizedEquipment.Weapons[0].id].name}">` : '';
        
        document.getElementById('belt1').innerHTML = organizedEquipment.Belts[0] ?
            `<img src="${allItems[organizedEquipment.Belts[0].id].image}" alt="${allItems[organizedEquipment.Belts[0].id].name}">` : '';
        
        document.getElementById('necklace1').innerHTML = organizedEquipment.Necklaces[0] ?
            `<img src="${allItems[organizedEquipment.Necklaces[0].id].image}" alt="${allItems[organizedEquipment.Necklaces[0].id].name}">` : '';
        
        document.getElementById('ring2').innerHTML = organizedEquipment.Rings[1] ?
            `<img src="${allItems[organizedEquipment.Rings[1].id].image}" alt="${allItems[organizedEquipment.Rings[1].id].name}">` : '';
        
        document.getElementById('boots1').innerHTML = organizedEquipment.Boots[0] ?
            `<img src="${allItems[organizedEquipment.Boots[0].id].image}" alt="${allItems[organizedEquipment.Boots[0].id].name}">` : '';

        // Atualiza o segundo conjunto de equipamentos
        document.getElementById('earring2').innerHTML = organizedEquipment.Earrings[1] ?
            `<img src="${allItems[organizedEquipment.Earrings[1].id].image}" alt="${allItems[organizedEquipment.Earrings[1].id].name}">` : '';
        
        document.getElementById('ring3').innerHTML = organizedEquipment.Rings[2] ?
            `<img src="${allItems[organizedEquipment.Rings[2].id].image}" alt="${allItems[organizedEquipment.Rings[2].id].name}">` : '';
        
        document.getElementById('weapon2').innerHTML = organizedEquipment.Weapons[1] ?
            `<img src="${allItems[organizedEquipment.Weapons[1].id].image}" alt="${allItems[organizedEquipment.Weapons[1].id].name}">` : '';
        
        document.getElementById('belt2').innerHTML = organizedEquipment.Belts[1] ?
            `<img src="${allItems[organizedEquipment.Belts[1].id].image}" alt="${allItems[organizedEquipment.Belts[1].id].name}">` : '';
        
        document.getElementById('necklace2').innerHTML = organizedEquipment.Necklaces[1] ?
            `<img src="${allItems[organizedEquipment.Necklaces[1].id].image}" alt="${allItems[organizedEquipment.Necklaces[1].id].name}">` : '';
        
        document.getElementById('ring4').innerHTML = organizedEquipment.Rings[3] ?
            `<img src="${allItems[organizedEquipment.Rings[3].id].image}" alt="${allItems[organizedEquipment.Rings[3].id].name}">` : '';
        
        document.getElementById('boots2').innerHTML = organizedEquipment.Boots[1] ?
            `<img src="${allItems[organizedEquipment.Boots[1].id].image}" alt="${allItems[organizedEquipment.Boots[1].id].name}">` : '';
    }
});
