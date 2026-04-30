import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.error(err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 16,
            border: "1px solid #f2c2c6",
            borderRadius: 8,
            color: "#a40e26",
            background: "#fff1f2",
          }}
        >
          Something went wrong.
        </div>
      );
    }
    return this.props.children;
  }
}
