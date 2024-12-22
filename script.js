const validDataSet = new Set(["123", "456", "789"]);

        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('user-form');
            const roommateCount = document.getElementById('roommate-count');
            const roommatesContainer = document.getElementById('roommates-container');
            const advisorApproval = document.getElementById('advisor-approval');
            const advisorApprovalContainer = document.getElementById('advisor-approval-container');
            const nameInput = document.getElementById('n');
            const nameFeedback = document.getElementById('name-feedback');

            // Validate user's name input
            nameInput.addEventListener('input', () => {
                const nameValue = nameInput.value.trim();
                if (!/^[a-zA-Z\s]+$/.test(nameValue)) {
                    nameFeedback.textContent = "Invalid name. Only letters and spaces are allowed.";
                } else {
                    nameFeedback.textContent = "";
                }
            });

            // Dynamically update roommate fields
            roommateCount.addEventListener('change', () => {
                const count = parseInt(roommateCount.value);
                roommatesContainer.innerHTML = '';
                for (let i = 1; i <= count; i++) {
                    roommatesContainer.innerHTML += `
                        <div class="roommate">
                            <label for="b${i}">Roommate ${i} Name:</label>
                            <input type="text" id="b${i}" name="buddy${i}" required>
                            <span id="buddy${i}-feedback"></span>
                            <br>
                            <label for="b${i}-grade">Roommate ${i} Grade Level:</label>
                            <input type="number" id="b${i}-grade" name="buddy${i}-grade" min="9" max="12" required>
                            <span id="buddy${i}-grade-feedback"></span>
                        </div>
                        <br>
                    `;
                }
                advisorApprovalContainer.style.display = 'none';
            });

            function validateField(input, feedback, gradeInput, gradeFeedback) {
                const value = input.value.trim();
                const grade = parseInt(gradeInput.value);
                let isValid = true;

                if (!validDataSet.has(value)) {
                    feedback.textContent = "The name you have inputted is invalid, please check your spelling.";
                    isValid = false;
                } else {
                    feedback.textContent = "";
                }

                document.querySelectorAll('.roommate').forEach((roommate, index) => {
                    const otherGradeInput = document.getElementById(`b${index + 1}-grade`);
                    if (otherGradeInput && otherGradeInput !== gradeInput) {
                        const otherGrade = parseInt(otherGradeInput.value);
                        if (Math.abs(grade - otherGrade) > 2) {
                            gradeFeedback.textContent = "Grade level difference exceeds 2 years.";
                            advisorApprovalContainer.style.display = 'block';
                            isValid = false;
                        } else {
                            gradeFeedback.textContent = "";
                        }
                    }
                });

                return isValid;
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const roommates = document.querySelectorAll('.roommate');
                let allValid = true;

                roommates.forEach((roommate, index) => {
                    const nameInput = document.getElementById(`b${index + 1}`);
                    const gradeInput = document.getElementById(`b${index + 1}-grade`);
                    const nameFeedback = document.getElementById(`buddy${index + 1}-feedback`);
                    const gradeFeedback = document.getElementById(`buddy${index + 1}-grade-feedback`);
                    const isValid = validateField(nameInput, nameFeedback, gradeInput, gradeFeedback);
                    allValid = allValid && isValid;
                });

                if (advisorApprovalContainer.style.display === 'block' && !advisorApproval.checked) {
                    alert("Please obtain advisor approval to proceed.");
                    return;
                }

                if (!allValid) {
                    alert("Please correct the invalid fields before submitting.");
                    return;
                }

                const formData = new FormData(form);
                const jsonData = {};

                formData.forEach((value, key) => {
                    jsonData[key] = value;
                });

                fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
                })
                    .then(response => {
                        if (response.ok) {
                            return response.blob();
                        }
                        throw new Error("Error in submission");
                    })
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = 'form_submissions.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        alert("File downloaded successfully!");
                    })
                    .catch(error => {
                        console.error(error);
                        alert("An error occurred while processing your request.");
                    });
            });
        });