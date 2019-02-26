# SystemVerilog Browser package

> Still in Alpha phase! Not stable can crash when putting on panel with Project.

This package, helps to track long systemverilog files. Current Features:
* Finds all class definitions in current file
* Finds all tasks/functions
* Supports nested SystemVerilog elements
* Jumping and highlighting of the class,task and function definition by clicking on the name of the element in SystemVerilog browser window
* Clicking on the heading will clear any highlighting made with SystemVerilog Browser
* Hotkey for toggle on/off are `ctrl` + `alt` + `s`

There is a lot of bugs, no test implemented yet.

TO-DO:
* Search for non wrapping SV elements (logic,bit,mailbox etc.)
* Search for occurences in SV code
* Adding icons for SV elements
* Search for other files in systemverilog hierarchy
