// Getting the form element
const form = document.getElementById("user-form");

// Adding the event listener for form submission
form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting

    // Getting the input values when the forn is filled
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const age = parseInt(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const activity = document.getElementById("activity").value;

    // Validating the input fields
    if (isNaN(weight) || isNaN(height) || isNaN(age) || gender === "Gendera" || activity === "Activity Level") {
        alert("Please fill in all the required fields.");
        return;
    }

    // Calculating the BMR based on gender
    let bmr;
    if (gender === "male") {
      bmr = 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
    } else {
      bmr = 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
    }

    // Calculating the daily calorie requirement as given in the question
    let calorieRequirement;
    if (activity === "light") {
        calorieRequirement = bmr * 1.375;
    } else if (activity === "moderate") {
        calorieRequirement = bmr * 1.55;
    } else if (activity === "active") {
        calorieRequirement = bmr * 1.725;
    }

    console.log(bmr);
    console.log(calorieRequirement);

    // Generating the meal plan using Newton Food API
    const mealPlanSection = document.getElementById("mealplanner");
    mealPlanSection.innerHTML = ""; // Clearing the existing content

    const apiUrl = "https://content.newtonschool.co/v1/pr/64995a40e889f331d43f70ae/categories";

    console.log(apiUrl);
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            if (!Array.isArray(data)) {
                console.error("Error: Invalid API response format.");
                return;
            }

            const mealPlanData = data.reduce((acc, category) => {
                const categoryMeals = Object.values(category).slice(1); // Getting the meal plan data from the category object properties
                return acc.concat(categoryMeals.filter(meal => meal !== undefined)); // Filtering out the undefined meals
            }, []);

            const getRandomMeals = (count) => {
                const randomMeals = [];
                const mealTypes = ["BREAKFAST", "DINNER", "LUNCH"];

                while (randomMeals.length < count) {
                    const randomIndex = Math.floor(Math.random() * mealPlanData.length);
                    const randomMeal = mealPlanData[randomIndex];

                    if (
                        randomMeal &&
                        randomMeal.image &&
                        randomMeal.readyInMinutes &&
                        randomMeal.title &&
                        !randomMeals.some((meal) => meal.id === randomMeal.id)
                    ) {
                        const mealType = mealTypes[randomMeals.length % 3]; // Cycling through the meal types so that i not get any undefined cards. 
                        randomMeals.push({...randomMeal,
                            mealType
                        });
                    }

                    mealPlanData.splice(randomIndex, 1); // im removing the selected meal from the available meals
                }

                return randomMeals;
            };


            const randomMeals = getRandomMeals(3);
             // trying to get only three caards from given the 9cards in api
            randomMeals.forEach((meal) => {
                const mealCardHTML = `
                  <div class="meal-card">
                    <h1>${meal.mealType}</h1>
                    <img src="${meal.image}" alt="${meal.title}">
                    <div class="card-body">
                      <h3>${meal.title}</h3>
                      <p class="calories p-cal">Calories: ${calorieRequirement}</p>
                      <button class="get-recipe btn1-recipe button" onclick="getRecipe(${meal.id})">Get Recipe</button>
                    </div>
                  </div>
                `;
              
                mealPlanSection.innerHTML += mealCardHTML;
              });

            // Showing the meal plan section
            mealPlanSection.style.display = "block";
        })
        .catch((error) => {
            console.error("Error fetching meal plan:", error);
        });
});
    



// Step 8: Generate Recipe
// Function to fetch recipe details based on meal ID
const getRecipe = (mealId) => {
  const apiUrl = `https://content.newtonschool.co/v1/pr/64996337e889f331d43f70ba/recipes/${mealId}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const recipeSection = document.querySelector(".recipe1");
      const ingredientsSection = document.getElementById("ingredients");
      const stepsSection = document.getElementById("steps");

      // Clear the existing HTML content
      ingredientsSection.innerHTML = "";
      stepsSection.innerHTML = "";

      // Populating the ingredients section
      const ingredientsList = data.ingredients.split(", ");
      const ingredientsHTML = ingredientsList.map((ingredient) => `<p>${ingredient.trim()}</p>`).join("");
      ingredientsSection.innerHTML = `<h2>INGREDIENTS</h2>${ingredientsHTML}`;

      // Populating the steps section
      const stepsList = data.steps.split(". ");
      const stepsHTML = stepsList.map((step) => `<p>${step.trim()}</p>`).join("");
      stepsSection.innerHTML = `<h2>STEPS</h2>${stepsHTML}`;

      // Show the recipe section
      recipeSection.style.display = "block";
    })
    .catch((error) => {
      console.error("Error fetching recipe:", error);
    });
};