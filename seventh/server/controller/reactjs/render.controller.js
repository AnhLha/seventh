
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Switch } from "react-router-dom";
import MainRouter from "../../../client/routerclient";
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from "../../../client/reducer/rootReducer";
import rootSaga from "../../../client/saga/rootSaga";
import { Provider } from 'react-redux';
import path from "path";

export default async function receive(req, res) {

  const title = "Hello";

  const context = {};

  const sagaMiddleware = createSagaMiddleware();
  let initialState = {};
  const store = createStore(rootReducer, initialState, applyMiddleware(sagaMiddleware));
  const preloadedState = store.getState();

  // không dùng stream
  const component = ReactDOMServer.renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        <Switch>
          <MainRouter />
        </Switch>
      </StaticRouter>
    </Provider>
  );

  //render ra file
  //trên productionpath.resolve(__dirname, "dist/public")
  try {
    res.sendFile(path.resolve(__dirname, "public/index.html"), { title: title, component: component, preloadedState: preloadedState });
  } catch (err) {
    console.error(err);
  }
  let sagaresult = await sagaMiddleware.run(rootSaga);//.toPromise();
}