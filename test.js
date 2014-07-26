

// http://docs.seleniumhq.org/docs/03_webdriver.jsp
// http://selenium.googlecode.com/git/docs/api/javascript/index.html

var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome().
        set('log.driver', webdriver.logging.LevelName.DEBUG)
      ).build();

driver.get('http://localhost:8080/form.html');

var promise = driver.sleep(1000); // Just for instructional purposes so you can see it working.

// Example of asynchronous debug logging.
promise.then(function () { console.log('After Sleep'); } );

driver.findElement(webdriver.By.id('field1')).sendKeys('some random text');

// Click the submit button
driver.findElement(webdriver.By.id('button1')).click();
waitUntilVisible(driver, '//a[text()="Page 2"]');
waitUntilVisible(driver, '//span[text()="some random text"]').then(function() {
  console.log('SUCCESS!');
});

// Go to Page 2
driver.findElement(webdriver.By.xpath('//a[text()="Page 2"]')).click();
waitUntilVisible(driver, '//h2[text()="This is Page 2"]');

// Another unnecessary delay to slow it down for learning purposes.
driver.sleep(3000);

// Go back to page 1.
driver.navigate().back();

// Uncomment the next line to see what a testing error looks like.

// waitUntilVisible(driver, 'div[text()="Lorem ipsum"]', 1000);

driver.quit(); // Closes the browser after all the tests pass


/**
 * Waits until a specified element is visible.
 *
 * @param  {!webdriver.WebDriver} the webdriver instance
 * @param  {!(webdriver.Locator|webdriver.By.Hash|Function|string)} locator findElement locator
 * @param  {number=} timeoutMs  defaults to 1000ms
 * @return {!webdriver.promise.Promise} a promise that will complete or throw a timeout error
 * @private
 */
function waitUntilVisible(driver, locator, opt_timeoutMs) {
  console.log("      waitUntilVisible(" + locator + ")");
  return _waitUntilVisibilityIs(driver, locator, true, opt_timeoutMs);
}

/**
 * Waits until a specified element is invisible.
 *
 * @param  {!webdriver.WebDriver} the webdriver instance
 * @param  {!(webdriver.Locator|webdriver.By.Hash|Function|string)} locator findElement locator
 * @param  {number=} timeoutMs  defaults to 1000ms
 * @return {!webdriver.promise.Promise} a promise that will complete or throw a timeout error
 * @private
 */
function waitUntilNotVisible(driver, locator, opt_timeoutMs) {
  console.log("      waitUntilNotVisible(" + locator + ")");
  return _waitUntilVisibilityIs(driver, locator, false, opt_timeoutMs);
}

/**
 * Waits until a specified element is either visible or invisible.
 *
 * @param  {!webdriver.WebDriver} the webdriver instance
 * @param  {!(webdriver.Locator|webdriver.By.Hash|Function|string)} locator findElement locator. If a
 *   string is provided, it is assumed to be an xpath selector.
 * @param  {boolean=} opt_visibility defaults to true
 * @param  {number=} timeoutMs  defaults to 1000ms
 * @return {!webdriver.promise.Promise} a promise that will complete or throw a timeout error
 * @private
 */
function _waitUntilVisibilityIs(driver, locator, opt_visibility, opt_timeoutMs) {
  var expectedVisibility = (typeof opt_visibility === 'undefined') ? true : opt_visibility;
  var timeoutMs = opt_timeoutMs || 1000;

  var locatorParam = locator;
  if (typeof locator === 'string') {
    locatorParam = webdriver.By.xpath(locator);
  }
  var visible = !expectedVisibility; // Assume condition not true until we know otherwise
  return driver.wait(function() {
    return driver.isElementPresent(locatorParam).
      then(function(isPresent) {
        if (isPresent) {
          // schedule updating the visible var
          driver.findElement(locatorParam).
            then(function(element) {
              return element.isDisplayed().
                  then(function(displayed) { visible = displayed; });
              },
              function findElError(e) {
                // assume not found. Perhaps visibility changed between wait condition checks?
                visible = false;
              });
          // return condition for wait
          return visible === expectedVisibility;
        } else { // ! isPresent
          return false === expectedVisibility;
        }
      });
  }, timeoutMs);
};

