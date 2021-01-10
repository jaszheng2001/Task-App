const sort = document.querySelector("#sortBy");
const filter = document.querySelector("#filter");
const filterBtn = document.querySelector("#filterBtn");
const taskItemContainer = document.querySelectorAll(".taskItem");
const submitBtn = document.querySelector("#submitBtn");

if (sessionStorage.getItem("sortBy"))
  sort.selectedIndex = sessionStorage.getItem("sortBy");
if (sessionStorage.getItem("filter"))
  filter.selectedIndex = sessionStorage.getItem("filter");

filterBtn.addEventListener("click", (e) => {
  let queryStr = "?";
  queryStr = queryStr + "sortBy=createdAt:" + sort.value;
  sessionStorage.setItem("sortBy", sort.selectedIndex);
  queryStr = queryStr + "&completed=" + filter.value;
  sessionStorage.setItem("filter", filter.selectedIndex);
  filterBtn.setAttribute("href", queryStr);
});

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch("api/tasks", {
    method: "POST",
    body: JSON.stringify({
      description: document.querySelector("#taskInput").value,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  location.reload(true);
});

taskItemContainer.forEach((item) => {
  item.addEventListener("click", async function (e) {
    const id = this.dataset.id;
    const completed = this.dataset.completed === "true" ? false : true;
    await fetch(`api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed: completed,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    location.reload(true);
  });

  const deleteBtn = document.querySelectorAll("#deleteBtn");
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      const id = this.dataset.id;
      await fetch(`api/tasks/${id}`, {
        method: "DELETE",
      });
    });
  });
});

document.querySelector("#heading a").addEventListener("click", clearStorage);

function clearStorage() {
  sessionStorage.clear();
}
