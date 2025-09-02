## 🛠️ Eva → JavaScript Transpiler  

In this project, I built a **transpiler in JavaScript from scratch** that converts an *Eva-like language* into **JavaScript**.  

The process works in a few steps:  

1. **Parse** the Eva code into an **AST (Abstract Syntax Tree)**  
2. **Transform** the Eva AST into a **JavaScript AST**  
3. **Generate** executable **JavaScript code**  

---
### Some Cool Features of my version of Eva 
- Multithreading : Implemented cooperative multitasking manually using generator functions allowing for concurrency/multithreading
- runtime environment to allow use of Javascript function and libraries
- Implemented Complex datastructures - Lists, Records (key,value storage), 

---
### 🔄 Example Walkthrough  

**0) Sample Eva Code**  
<img width="272" height="63" alt="Eva code" src="https://github.com/user-attachments/assets/5f6ecc6a-0ecf-4378-88ae-26907376a038" />

---

**1) Eva → Eva AST**  
<img width="442" height="77" alt="Eva AST" src="https://github.com/user-attachments/assets/7cd6130b-f3e0-49a6-94bd-f865d891435d" />

---

**2) Eva AST → JavaScript AST**   
shoutout to [AST Explorer](https://astexplorer.net/) — it was **massively helpful** in figuring out how the JavaScript AST should be structured.  

<img width="289" height="858" alt="JS AST" src="https://github.com/user-attachments/assets/25732b42-d6f3-4aef-8630-ee705cf9b319" />

---

**3) JavaScript AST → JavaScript Code**  
<img width="179" height="141" alt="JS code" src="https://github.com/user-attachments/assets/52fe410c-4373-4cac-9f65-04fd61558106" />

---

**4) Execution Result 🎉**  
<img width="164" height="120" alt="Execution result" src="https://github.com/user-attachments/assets/d9048283-682b-4317-a2ef-ef7437e985e9" />
