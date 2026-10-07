export const getSettings = (req, res) => {
  return res.render("settings", {
    title: "Settings",
    css: "/css/settings.css",
    user: req.session.user,
  });
};
