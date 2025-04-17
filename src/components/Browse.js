import React, { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { APIoptions } from "../utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import { addNowPlayingMovies, addNowPopularMovies, addNowUpcomingMovies } from "../utils/Movieslice";
import Maincontainer from "./Maincontainer";
import Secondary from "./Secondary";
import Gptsearch from "./Gptsearch";

const Browse = () => {
  const showgptsearch = useSelector(store=>store.gpt.showgptsearch)
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Single instance of dispatch

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDetails(user);
      } else {
        navigate("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const [nowPlayingRes, popularRes, nowupcoming] = await Promise.all([
        fetch("https://api.themoviedb.org/3/movie/now_playing?page=1", APIoptions),
        fetch("https://api.themoviedb.org/3/movie/popular?page=1", APIoptions),
        fetch('https://api.themoviedb.org/3/movie/upcoming?page=1', APIoptions)
      ]);

      const nowPlayingJson = await nowPlayingRes.json();
      const popularJson = await popularRes.json();
      const upcomingjson = await nowupcoming.json();

     

      dispatch(addNowPlayingMovies(nowPlayingJson.results));
      dispatch(addNowPopularMovies(popularJson.results));
      dispatch(addNowUpcomingMovies(upcomingjson.results));
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchMovies();
    }
  }, [userDetails]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="browsepage">
      <Header />
      {
        showgptsearch?
        (<Gptsearch/>):(<>
          <Maincontainer />
          <Secondary />
        </>
        )}
     
    </div>
  );
};

export default Browse;
