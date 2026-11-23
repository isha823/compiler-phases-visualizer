# C Compiler — Testing Programs
### Ye sab programs apne compiler mein paste kar ke test kar sakte ho

---

## 1. Data Types

```c
int a = 7;
float b = 2.5;
double c = 3.14159;
char d = 'A';
printf("%d %.1f %.5f %c\n", a, b, c, d);
```
**Expected Output:** `7 2.5 3.14159 A`

---

```c
int x = -42;
float y = -3.14;
printf("%d %.2f\n", x, y);
```
**Expected Output:** `-42 -3.14`

---

```c
char c = 'a';
int n = c + 1;
printf("%d %c\n", n, n);
```
**Expected Output:** `98 b`

---

## 2. Variables & Constants

```c
#define SIZE 5
const float PI = 3.14;
int r = SIZE;
printf("%.2f\n", PI * r * r);
```
**Expected Output:** `78.50`

---

```c
int a = 1, b = 2, c = 3;
printf("%d %d %d\n", a, b, c);
```
**Expected Output:** `1 2 3`

---

```c
int x = 5;
x = 10;
x = 20;
printf("%d\n", x);
```
**Expected Output:** `20`

---

## 3. Input / Output (printf, scanf)

```c
int n;
printf("Enter a number: ");
scanf("%d", &n);
printf("Double = %d\n", n * 2);
```
**Input:** `21`
**Expected Output:** `Double = 42`

---

```c
int a, b;
scanf("%d %d", &a, &b);
printf("Sum = %d\n", a + b);
```
**Input:** `10 20`
**Expected Output:** `Sum = 30`

---

```c
printf("%x\n", 255);
```
**Expected Output:** `ff`

---

## 4. Arithmetic Operators

```c
int a = 17, b = 5;
printf("%d %d %d %d %d\n", a+b, a-b, a*b, a/b, a%b);
```
**Expected Output:** `22 12 85 3 2`

---

```c
int r = 2 + 3 * 4;
printf("%d\n", r);
```
**Expected Output:** `14`

---

```c
int r = (2 + 3) * 4;
printf("%d\n", r);
```
**Expected Output:** `20`

---

```c
float a = 7.0, b = 2.0;
printf("%.2f\n", a / b);
```
**Expected Output:** `3.50`

---

## 5. Relational Operators

```c
int a = 4, b = 9;
printf("%d %d %d %d\n", a<b, a>b, a==b, a!=b);
```
**Expected Output:** `1 0 0 1`

---

```c
int x = 5, y = 5;
printf("%d %d %d %d\n", x==y, x!=y, x<=y, x>=y);
```
**Expected Output:** `1 0 1 1`

---

## 6. Logical Operators

```c
int a = 1, b = 0;
printf("%d %d %d\n", a&&b, a||b, !a);
```
**Expected Output:** `0 1 0`

---

```c
int x = 7;
if (x > 5 && x < 10)
    printf("in range\n");
else
    printf("out\n");
```
**Expected Output:** `in range`

---

## 7. Assignment Operators

```c
int x = 10;
x += 5;
x *= 2;
x -= 4;
x /= 2;
x %= 5;
x++;
printf("%d\n", x);
```
**Expected Output:** `4`

---

```c
int a = 5;
a++;
printf("%d\n", a);
a--;
a--;
printf("%d\n", a);
```
**Expected Output:**
`6`
`4`

---

## 8. If Statement

```c
int age = 20;
if (age >= 18) {
    printf("Adult\n");
}
```
**Expected Output:** `Adult`

---

```c
int x = 0;
if (x)
    printf("yes\n");
printf("no x\n");
```
**Expected Output:** `no x`

---

## 9. If-else Statement

```c
int n = 7;
if (n % 2 == 0)
    printf("Even\n");
else
    printf("Odd\n");
```
**Expected Output:** `Odd`

---

```c
int grade = 85;
if (grade >= 50)
    printf("Pass\n");
else
    printf("Fail\n");
```
**Expected Output:** `Pass`

---

## 10. Nested If-else

```c
int m = 72;
if (m >= 50) {
    if (m >= 80) printf("A\n");
    else printf("B\n");
} else {
    printf("Fail\n");
}
```
**Expected Output:** `B`

---

```c
int x = 0;
if (x > 0) printf("positive\n");
else {
    if (x < 0) printf("negative\n");
    else printf("zero\n");
}
```
**Expected Output:** `zero`

---

## 11. Switch Statement

```c
int d = 3;
switch (d) {
    case 1: printf("Mon\n"); break;
    case 3: printf("Wed\n"); break;
    default: printf("Other\n");
}
```
**Expected Output:** `Wed`

---

```c
char c = 'B';
switch (c) {
    case 'A': printf("A\n"); break;
    case 'B': printf("B\n"); break;
    default:  printf("other\n");
}
```
**Expected Output:** `B`

---

```c
int x = 1;
switch (x) {
    case 1: printf("a\n");
    case 2: printf("b\n"); break;
    default: printf("c\n");
}
```
**Expected Output:** `a` phir `b` (fall-through)

---

## 12. For Loop

```c
for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}
```
**Expected Output:** `1 2 3 4 5 `

---

```c
int sum = 0;
for (int i = 1; i <= 10; i++) {
    sum += i;
}
printf("%d\n", sum);
```
**Expected Output:** `55`

---

```c
for (int i = 1; i <= 2; i++) {
    for (int j = 1; j <= 3; j++) {
        printf("%d ", i * j);
    }
}
```
**Expected Output:** `1 2 3 2 4 6 `

---

## 13. While Loop

```c
int i = 1;
while (i <= 5) {
    printf("%d ", i);
    i++;
}
```
**Expected Output:** `1 2 3 4 5 `

---

```c
int i = 1, sum = 0;
while (i <= 100) {
    sum += i;
    i++;
}
printf("%d\n", sum);
```
**Expected Output:** `5050`

---

## 14. Do-while Loop

```c
int i = 1;
do {
    printf("%d ", i);
    i++;
} while (i <= 5);
```
**Expected Output:** `1 2 3 4 5 `

---

```c
int i = 10;
do {
    printf("runs once\n");
    i++;
} while (i < 5);
```
**Expected Output:** `runs once`

---

## 15. Break & Continue

```c
for (int i = 1; i <= 10; i++) {
    if (i == 3) continue;
    if (i == 7) break;
    printf("%d ", i);
}
```
**Expected Output:** `1 2 4 5 6 `

---

```c
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;
    printf("%d ", i);
}
```
**Expected Output:** `1 3 5 7 9 `

---

## 16. Arrays (1D & 2D)

```c
int a[5] = {4, 8, 15, 16, 23};
int s = 0;
for (int i = 0; i < 5; i++) s += a[i];
printf("%d\n", s);
```
**Expected Output:** `66`

---

```c
int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        printf("%d ", m[i][j]);
    }
}
```
**Expected Output:** `1 2 3 4 5 6 `

---

```c
int a[5] = {3, 1, 4, 1, 5};
int max = a[0];
for (int i = 1; i < 5; i++) {
    if (a[i] > max) max = a[i];
}
printf("%d\n", max);
```
**Expected Output:** `5`

---

## 17. Strings (char arrays)

```c
char name[20] = "isha";
char t[30];
strcpy(t, name);
strcat(t, " & rabia");
printf("%s has %d letters\n", t, strlen(t));
```
**Expected Output:** `isha & rabia has 12 letters`

---

```c
char a[10] = "abc";
char b[10] = "abc";
printf("%d\n", strcmp(a, b));
```
**Expected Output:** `0`

---

## 18. Functions

```c
int add(int a, int b) {
    return a + b;
}
int main() {
    printf("%d\n", add(3, 4));
    return 0;
}
```
**Expected Output:** `7`

---

```c
int square(int n) {
    return n * n;
}
int main() {
    for (int i = 1; i <= 5; i++) {
        printf("%d ", square(i));
    }
    return 0;
}
```
**Expected Output:** `1 4 9 16 25 `

---

```c
int maxOf(int a, int b) {
    if (a > b) return a;
    return b;
}
int main() {
    printf("%d\n", maxOf(10, 20));
    return 0;
}
```
**Expected Output:** `20`

---

## 19. Recursion

```c
int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}
int main() {
    printf("%d\n", fact(5));
    return 0;
}
```
**Expected Output:** `120`

---

```c
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
int main() {
    printf("%d\n", fib(7));
    return 0;
}
```
**Expected Output:** `13`

---

```c
void countdown(int n) {
    if (n <= 0) {
        printf("Go!\n");
        return;
    }
    printf("%d ", n);
    countdown(n - 1);
}
int main() {
    countdown(5);
    return 0;
}
```
**Expected Output:** `5 4 3 2 1 Go!`

---

## 20. Pointers (basic)

```c
int main() {
    int x = 5;
    int *p = &x;
    *p = *p + 1;
    printf("%d\n", x);
    return 0;
}
```
**Expected Output:** `6`

---

```c
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}
int main() {
    int x = 5, y = 9;
    swap(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}
```
**Expected Output:** `9 5`

---

```c
void doubleVal(int *n) {
    *n = *n * 2;
}
int main() {
    int x = 7;
    doubleVal(&x);
    printf("%d\n", x);
    return 0;
}
```
**Expected Output:** `14`

---

## 21. Structures (basic)

```c
struct Student {
    int id;
    char name[20];
    float marks;
};
int main() {
    struct Student s = {1, "Isha", 88.5};
    struct Student *p = &s;
    p->marks = 90;
    printf("%d %s %.1f\n", s.id, s.name, p->marks);
    return 0;
}
```
**Expected Output:** `1 Isha 90.0`

---

```c
struct Point {
    int x;
    int y;
};
int main() {
    struct Point pts[3] = {{1,2},{3,4},{5,6}};
    for (int i = 0; i < 3; i++) {
        printf("%d,%d ", pts[i].x, pts[i].y);
    }
    return 0;
}
```
**Expected Output:** `1,2 3,4 5,6 `

---

## 22. Comments

```c
// single line comment
/* multi
   line comment */
int x = 5; // x is five
printf("%d\n", x);
```
**Expected Output:** `5`

---

## 23. Type Casting

```c
int a = 7, b = 2;
printf("%d %.2f\n", a / b, (float)a / b);
```
**Expected Output:** `3 3.50`

---

```c
float f = 3.99;
int i = (int)f;
printf("%d\n", i);
```
**Expected Output:** `3`

---

```c
int total = 7, count = 2;
float avg = (float)total / count;
printf("%.1f\n", avg);
```
**Expected Output:** `3.5`

---

## ERROR Test Programs
### (Ye sab ERROR dene chahiye)

```c
// ERROR 1: undeclared variable
int main() {
    y = 5;
    return 0;
}
```
**Expected:** Semantic Error — `'y' is not declared`

---

```c
// ERROR 2: string to int
int x = "hello";
printf("%d\n", x);
```
**Expected:** Semantic Error — `cannot assign a string to a int variable`

---

```c
// ERROR 3: const reassignment
const int X = 5;
X = 10;
printf("%d\n", X);
```
**Expected:** Semantic Error — `cannot assign to const variable`

---

```c
// ERROR 4: break outside loop
int main() {
    break;
    return 0;
}
```
**Expected:** Semantic Error — `break used outside a loop`

---

```c
// ERROR 5: missing semicolon
int main() {
    int x = 5
    return x;
}
```
**Expected:** Syntax Error — `missing ';'`

---

```c
// ERROR 6: division by zero
int main() {
    int x = 5 / 0;
    printf("%d\n", x);
    return 0;
}
```
**Expected:** Semantic Error — `division by zero`

---

## Big Combined Program

```c
#define SIZE 3

struct Student {
    int id;
    float marks;
};

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}

int main() {
    struct Student s[SIZE] = {{1, 70.5}, {2, 85}, {3, 92.25}};
    float sum = 0;
    for (int i = 0; i < SIZE; i++) {
        sum += s[i].marks;
    }
    printf("Average = %.2f\n", sum / SIZE);

    int x = 5, y = 9;
    swap(&x, &y);
    printf("x = %d, y = %d\n", x, y);

    printf("5! = %d\n", fact(5));

    return 0;
}
```
**Expected Output:**
```
Average = 82.58
x = 9, y = 5
5! = 120
```
