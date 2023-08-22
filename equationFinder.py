# This python program will give an equation that can be graphed to pass through the points (min x, min y) and (max x, max y)

y1 = float(input("Enter min y: "))
x1 = float(input("Enter min x: "))

y2 = float(input("Enter max y: "))
x2 = float(input("Enter max x: "))

xVar = input("What to represent x as? \nLeave blank and press enter for default value: ")

m = (y2 - y1) / (x2 - x1)

b = y1 - (m * x1)

if (xVar.__len__() == 0):
    if b >= 0:
        print("Equation: y = " + str(m) + "x + " + str(b))
    else:
        print("Equation: y = " + str(m) + "x - " + str(b * -1))
else:
    if b >= 0:
        print("Equation: y = " + str(m) + " * " + xVar + " + " + str(b))
    else:
        print("Equation: y = " + str(m) + " * " + xVar + " - " + str(b * -1))