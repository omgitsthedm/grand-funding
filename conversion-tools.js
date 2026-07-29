(() => {
  if ("undefined" == typeof document) return;
  document.querySelectorAll(".loan-calc[data-project-calc]").forEach((calc) => {
    if (!calc || calc.dataset.init === "1") return;
    calc.dataset.init = "1";

    const inputs = {
      purchase: calc.querySelector('[data-project-calc="purchase"]'),
      rehab: calc.querySelector('[data-project-calc="rehab"]'),
      value: calc.querySelector('[data-project-calc="value"]'),
    };
    const outputs = {
      spread: calc.querySelector('[data-project-calc="spread"]'),
      purchase: calc.querySelector('[data-project-calc="purchase-output"]'),
      rehab: calc.querySelector('[data-project-calc="rehab-output"]'),
      cost: calc.querySelector('[data-project-calc="cost"]'),
      value: calc.querySelector('[data-project-calc="value-output"]'),
    };

    const parseCurrency = (value) =>
      Number.parseFloat(String(value || "0").replace(/[^0-9.]/g, "")) || 0;
    const formatCurrency = (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Math.round(value));

    const update = () => {
      const purchase = parseCurrency(inputs.purchase?.value);
      const rehab = parseCurrency(inputs.rehab?.value);
      const expectedValue = parseCurrency(inputs.value?.value);
      const totalCost = purchase + rehab;
      const spread = expectedValue - totalCost;

      if (outputs.spread) outputs.spread.textContent = formatCurrency(spread);
      if (outputs.purchase) {
        outputs.purchase.textContent = formatCurrency(purchase);
      }
      if (outputs.rehab) outputs.rehab.textContent = formatCurrency(rehab);
      if (outputs.cost) outputs.cost.textContent = formatCurrency(totalCost);
      if (outputs.value) {
        outputs.value.textContent = formatCurrency(expectedValue);
      }
    };

    Object.values(inputs).forEach((input) => {
      if (!input) return;
      input.addEventListener("input", update);
      input.addEventListener("blur", () => {
        const value = parseCurrency(input.value);
        if (value > 0) input.value = formatCurrency(value);
      });
    });

    update();
  });
  document.querySelectorAll(".quiz").forEach((e) => {
    if (!e || "1" === e.dataset.init) return;
    e.dataset.init = "1";
    const t = e.querySelectorAll(".quiz__step"),
      a = e.querySelectorAll(".quiz__progress-bar"),
      r = {};
    let o = 0;
    const l = (e) => {
      (t.forEach((t, a) => t.classList.toggle("active", a === e)),
        a.forEach((t, a) => t.classList.toggle("active", a <= e)),
        (o = e));
    };
    e.querySelectorAll(".quiz__option").forEach((a) => {
      a.addEventListener("click", () => {
        const n = a.dataset.key,
          c = a.dataset.value;
        if (((r[n] = c), o < t.length - 2)) l(o + 1);
        else {
          const a = (() => {
              const { goal: e, hold: t, speed: a } = r;
              return "buying" === e && "flip" === t
                ? {
                    product: "Fix & Flip Loan",
                    url: "/fix-and-flip-loans-arizona",
                    reason:
                      "Built for investors who acquire, renovate, and resell. Loan sizing, leverage, and final terms are set after direct deal review.",
                  }
                : "buying" === e && "rental" === t
                  ? {
                      product: "Bridge Loan",
                      url: "/bridge-loans-arizona",
                      reason:
                        "Useful for a time-sensitive acquisition with a clear exit, including a later refinance into longer-term financing.",
                    }
                  : "buying" === e && "build" === t
                    ? {
                        product: "Construction Loan",
                        url: "/construction-loans-arizona",
                        reason:
                          "Ground-up or major-renovation financing with a project budget, experienced team, and milestone-based draw plan.",
                      }
                    : "refi" === e && "rental" === t
                      ? {
                          product: "Cash-Out Refinance",
                          url: "/cash-out-refinance-investors-arizona",
                          reason:
                            "Designed to review equity extraction from an eligible property while replacing the existing financing.",
                        }
                      : "cashout" === e
                        ? {
                            product: "2nd Position Loan",
                            url: "/second-position-loans-arizona",
                            reason:
                              "May preserve an existing first mortgage while adding a junior lien, subject to a case-specific lien and property review.",
                          }
                        : {
                            product: "Bridge Loan",
                            url: "/bridge-loans-arizona",
                            reason:
                              "A flexible starting point for active investor transactions. Grand Funding reviews the property, purpose, and exit directly.",
                          };
            })(),
            o = e.querySelector(".quiz__result");
          if (o) {
            const e = o.querySelector(".quiz__result-product"),
              r = o.querySelector(".quiz__result-explainer"),
              n = o.querySelector(".quiz__result-cta");
            (e && (e.textContent = a.product),
              r && (r.textContent = a.reason),
              n && (n.href = a.url),
              l(t.length - 1));
          }
        }
      });
    });
    const n = e.querySelector(".quiz__result-restart");
    (n &&
      n.addEventListener("click", () => {
        (Object.keys(r).forEach((e) => delete r[e]), l(0));
      }),
      l(0));
  });
})();
