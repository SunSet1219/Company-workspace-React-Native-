
'use strict';


class NavigationTracker {

  constructor() {
    this.previousScene = '';
    this.currentScene = '';
    this.routeStackLength = 1;

    this.setCurrentScene = this.setCurrentScene.bind(this);
    this.getCurrentScene = this.getCurrentScene.bind(this);
    this.getPreviousScene = this.getPreviousScene.bind(this);
    this.setSubscene = this.setSubscene.bind(this);
    this.unsetSubscene = this.unsetSubscene.bind(this);
    this.getRouteStackLength = this.getRouteStackLength.bind(this);
  }


  setCurrentScene(sceneKey) {
    this.previousScene = this.currentScene;
    this.currentScene = sceneKey;
    this.routeStackLength = 1;
  }


  getCurrentScene() {
    return this.currentScene;
  }


  getPreviousScene() {
    return this.previousScene;
  }


  setSubscene() {
    this.routeStackLength++;
  }


  unsetSubscene() {
    this.routeStackLength--;
  }


  getRouteStackLength() {
    return this.routeStackLength;
  }

}


export default NavigationTracker;
