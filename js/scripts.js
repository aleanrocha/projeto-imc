"use strict"

// seleção de elementos

const container = document.querySelector("#container")
const calcContainer = document.querySelector("#calc-container")
const resultContainer = document.querySelector("#result-container")
const heightInput = document.querySelector("#iheight")
const weightInput = document.querySelector("#iweight")
const imcTable = document.querySelector("#imc-table")
const imcNumber = document.querySelector("#imc-number span")
const imcInfo = document.querySelector("#imc-info span")
const calcBtn = document.querySelector("#calc-btn")
const clearBtn = document.querySelector("#clear-calc-btn")
const backBtn = document.querySelector("#back-btn")

// Funções

// Obtém os dados do arquivo JSON
const fetchData = async () => {
  try {
    const response = await fetch("./json/data.json")
    return await response.json()
  } catch (err) {
    console.log(`Erro ao obter os dados - ${err}`)
  }
}

// Cria a tábela de IMC
const createTable = async () => {
  const data = await fetchData()
  data.forEach((item) => {
    const div = document.createElement("div")
    const classification = document.createElement("p")
    const info = document.createElement("p")
    const obesity = document.createElement("p")
    div.classList.add(`table-data`)
    classification.textContent = `${item.classification}`
    info.textContent = `${item.info}`
    obesity.textContent = `${item.obesity}`
    div.append(classification, info, obesity)
    imcTable.appendChild(div)
  })
}
createTable()

// Limpa os inputs
const clearInputs = () => {
  heightInput.value = ""
  weightInput.value = ""
  imcInfo.classList = ""
  imcNumber.classList = ""
}

// Faz uma validaão para que só aceite números
const isValidDigits = (txt) => {
  return txt.replace(/[^0-9,]/g, "")
}

// Limpa as classes da (table-data)
const clearCssClasses = () => {
  document.querySelectorAll("[class^='table-data']").forEach(item => {
    const classes = item.classList 
    if (classes.contains("table-data") && classes.length > 1) {
      const index = Array.from(classes).indexOf("table-data")
      classes.remove(classes[index + 1])
    }
  })
}

// Adiciona classes de estilo ao imcNumber e imcInfo
const addCssClasses = (className) => {
[imcInfo,imcNumber].forEach((item) => item.classList.add(className))
}

// Adiciona classe de estilo com base no índice
const toggleColorClass = (index, className) => {
  const tableData = document.querySelectorAll(".table-data")
  tableData[index].classList.add(className)
}

// Aplica os estilos d destaque a tabela IMC
const applyIMCStyles = (info, obesity, minValue) => {
  if(info === "Magreza") {
    addCssClasses("low")
    toggleColorClass(0,`color-${minValue}`)
  } else if (info === "Peso ideal") {
    addCssClasses("good")
    toggleColorClass(1,`color-${minValue}`)
  } else if ((info === "Obesidade" && obesity !== "III (mórbida)") || info === "Sobrepeso") {
    addCssClasses("medium")
    if (obesity === "0") {toggleColorClass(2,`color-${minValue}`)} 
    else if (obesity == "I") {toggleColorClass(3,`color-${minValue}`)}
    else {toggleColorClass(4,`color-${minValue}`)}
  } else if (info === "Obesidade" && obesity === "III (mórbida)") {
    addCssClasses("height")
    toggleColorClass(5,`color-${minValue}`)
  }
}

// Busca e associa as informações do IMC
const updateIMCInfo = (data, resultImc) => {
  let [info, obesity] = ""
  let minValue = 0
  data.forEach((item) => {
    if (resultImc >= item.min && resultImc <= item.max) {
      info = item.info
      obesity = item.obesity
      minValue = item.min.toFixed(0)
    } 
  })
  if(!info) {
    alert("Digite valores válidos!")
    return
  }
  container.classList.add("transition")
  imcNumber.textContent = resultImc
  imcInfo.textContent = info
  clearCssClasses()
  applyIMCStyles(info, obesity, minValue)
}

// Faz o cálculo do IMC
const calcImc = async () => {
  const data = await fetchData()
  const weightValue = +weightInput.value.replace(",", ".")
  const heightValue = +heightInput.value.replace(",", ".")
  const resultImc = (weightValue / (heightValue * heightValue)).toFixed(1)
  updateIMCInfo(data, resultImc)
}

// Verifica se foram passados valores vazios
const listener = () => {
  if(heightInput.value && weightInput.value) {
    calcImc()
  } else if (!heightInput.value && weightInput.value) {
    heightInput.classList.add("outline")
  } else if (!weightInput.value && heightInput.value) {
    weightInput.classList.add("outline")
  } else if (!heightInput.value && !weightInput.value) {
    weightInput.classList.add("outline")
    heightInput.classList.add("outline")
  }
}

// Eventos

// Evento de input para atualização dos valores por vazio
// caso seja string e não Number
[heightInput, weightInput].map((input) => {
  input.addEventListener("input", (e) => {
    const updateInputValue = isValidDigits(e.target.value)
    e.target.value = updateInputValue
    input.classList.remove("outline")
  })
})

// Evento de click para o botão calcular
calcBtn.addEventListener("click", () => {
  listener()
})

// Evento de teclado para chamar a função de cáclulo
// quando a tecla enter for pressionda
document.addEventListener("keydown", (e) => {
  if(e.key === "Enter") {
    listener()
  }
})

// Evento para limpar os inputs
clearBtn.addEventListener("click", clearInputs)

// Evento para o botão de voltar da parte da tabela
backBtn.addEventListener("click", () => {
  container.classList.remove("transition")
  clearInputs()
})